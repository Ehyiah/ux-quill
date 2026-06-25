<?php

namespace Ehyiah\QuillJsBundle\Tests\Controller;

use Ehyiah\QuillJsBundle\Controller\SynonymController;
use Ehyiah\QuillJsBundle\DTO\Synonym\DummySynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\Synonym;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderRegistry;
use Ehyiah\QuillJsBundle\Event\Synonym\AfterSynonymSearchEvent;
use Ehyiah\QuillJsBundle\Event\Synonym\BeforeSynonymSearchEvent;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use RuntimeException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\Controller\SynonymController
 */
final class SynonymControllerTest extends TestCase
{
    private SynonymProviderRegistry $registry;
    private EventDispatcherInterface&MockObject $dispatcher;

    protected function setUp(): void
    {
        parent::setUp();

        $this->registry = new SynonymProviderRegistry([
            new DummySynonymProvider(),
        ]);

        $this->dispatcher = $this->createMock(EventDispatcherInterface::class);
    }

    private function createController(): SynonymController
    {
        return new SynonymController($this->registry, $this->dispatcher);
    }

    /**
     * @covers ::__invoke
     */
    public function testSuccessfulRequest(): void
    {
        $this->dispatcher->expects($this->exactly(2))
            ->method('dispatch')
            ->with(
                $this->logicalOr(
                    $this->isInstanceOf(BeforeSynonymSearchEvent::class),
                    $this->isInstanceOf(AfterSynonymSearchEvent::class),
                ),
            )
        ;

        $controller = $this->createController();

        $request = new Request(
            content: json_encode([
                'provider' => DummySynonymProvider::class,
                'word' => 'important',
                'locale' => 'fr',
            ]),
        );

        $response = $controller($request);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertIsArray($data);
        $this->assertCount(2, $data);
        $this->assertSame('essentiel', $data[0]['word']);
        $this->assertSame(1, $data[0]['score']);
    }

    /**
     * @covers ::__invoke
     */
    public function testBeforeEventContainsExpectedData(): void
    {
        $this->dispatcher->expects($this->exactly(2))
            ->method('dispatch')
            ->with($this->callback(function ($event) {
                if ($event instanceof BeforeSynonymSearchEvent) {
                    $this->assertSame(DummySynonymProvider::class, $event->provider);
                    $this->assertSame('important', $event->word);
                    $this->assertSame('Ce projet est important', $event->context);
                    $this->assertSame('fr', $event->locale);
                }

                return true;
            }))
        ;

        $controller = $this->createController();

        $request = new Request(
            content: json_encode([
                'provider' => DummySynonymProvider::class,
                'word' => 'important',
                'context' => 'Ce projet est important',
                'locale' => 'fr',
            ]),
        );

        $controller($request);
    }

    /**
     * @covers ::__invoke
     */
    public function testAfterEventContainsSynonyms(): void
    {
        $this->dispatcher->expects($this->exactly(2))
            ->method('dispatch')
            ->with($this->callback(function ($event) {
                if ($event instanceof AfterSynonymSearchEvent) {
                    $this->assertCount(2, $event->results);
                    $this->assertContainsOnlyInstancesOf(Synonym::class, $event->results);
                    $this->assertSame('essentiel', $event->results[0]->word);
                }

                return true;
            }))
        ;

        $controller = $this->createController();

        $request = new Request(
            content: json_encode([
                'provider' => DummySynonymProvider::class,
                'word' => 'important',
                'locale' => 'fr',
            ]),
        );

        $controller($request);
    }

    /**
     * @covers ::__invoke
     */
    public function testMissingProvider(): void
    {
        $controller = $this->createController();

        $request = new Request(
            content: json_encode([
                'word' => 'important',
            ]),
        );

        /** @var JsonResponse $response */
        $response = $controller($request);

        $this->assertSame(400, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
    }

    /**
     * @covers ::__invoke
     */
    public function testMissingWord(): void
    {
        $controller = $this->createController();

        $request = new Request(
            content: json_encode([
                'provider' => DummySynonymProvider::class,
            ]),
        );

        /** @var JsonResponse $response */
        $response = $controller($request);

        $this->assertSame(400, $response->getStatusCode());
    }

    /**
     * @covers ::__invoke
     */
    public function testUnknownProvider(): void
    {
        $controller = $this->createController();

        $request = new Request(
            content: json_encode([
                'provider' => 'Unknown\Provider',
                'word' => 'important',
            ]),
        );

        /** @var JsonResponse $response */
        $response = $controller($request);

        $this->assertSame(400, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertStringContainsString('Unknown provider', $data['error']);
    }

    /**
     * @covers ::__invoke
     */
    public function testWithContext(): void
    {
        $controller = $this->createController();

        $request = new Request(
            content: json_encode([
                'provider' => DummySynonymProvider::class,
                'word' => 'important',
                'context' => 'Ce projet est important',
                'locale' => 'fr',
            ]),
        );

        $response = $controller($request);

        $this->assertSame(200, $response->getStatusCode());
    }

    /**
     * @covers ::__invoke
     */
    public function testEmptyResponse(): void
    {
        $provider = new class implements SynonymProviderInterface {
            public function getSynonyms(string $word, ?string $context = null, string $locale = 'fr'): array
            {
                return [];
            }

            public function validate(): void
            {
            }
        };

        $registry = new SynonymProviderRegistry([$provider]);
        $controller = new SynonymController($registry, $this->dispatcher);

        $request = new Request(
            content: json_encode([
                'provider' => $provider::class,
                'word' => 'unknown',
            ]),
        );

        /** @var JsonResponse $response */
        $response = $controller($request);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('[]', $response->getContent());
    }

    /**
     * @covers ::__invoke
     */
    public function testInvalidJson(): void
    {
        $controller = $this->createController();

        $request = new Request(
            content: 'not json',
        );

        /** @var JsonResponse $response */
        $response = $controller($request);

        $this->assertSame(400, $response->getStatusCode());
    }

    /**
     * @covers ::__invoke
     */
    public function testProviderValidationFailure(): void
    {
        $provider = new class implements SynonymProviderInterface {
            public function getSynonyms(string $word, ?string $context = null, string $locale = 'fr'): array
            {
                return [];
            }

            public function validate(): void
            {
                throw new RuntimeException('Custom validation error');
            }
        };

        $registry = new SynonymProviderRegistry([$provider]);
        $controller = new SynonymController($registry, $this->dispatcher);

        $request = new Request(
            content: json_encode([
                'provider' => $provider::class,
                'word' => 'test',
            ]),
        );

        /** @var JsonResponse $response */
        $response = $controller($request);

        $this->assertSame(400, $response->getStatusCode());

        $data = json_decode($response->getContent(), true);
        $this->assertStringContainsString('Custom validation error', $data['error']);
    }
}
