<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\DTO\Modules\SynonymModule
 */
final class SynonymModuleTest extends TestCase
{
    /**
     * @covers ::__construct
     */
    public function testConstructorThrowsWithoutProvider(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('provider');

        new SynonymModule();
    }

    /**
     * @covers ::__construct
     */
    public function testConstructorThrowsWithEmptyProvider(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new SynonymModule(options: ['provider' => '']);
    }

    /**
     * @covers ::__construct
     */
    public function testCustomProvider(): void
    {
        $module = new SynonymModule(options: [
            'provider' => 'App\Quill\MyCustomProvider',
        ]);

        $this->assertSame('App\Quill\MyCustomProvider', $module->options['provider']);
    }
}
