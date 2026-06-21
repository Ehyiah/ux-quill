<?php

namespace Ehyiah\QuillJsBundle\Tests\Config;

use Ehyiah\QuillJsBundle\Config\QuillConfigBuilder;
use Ehyiah\QuillJsBundle\DTO\Fields\BlockField\HeaderField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\UnderlineField;
use Ehyiah\QuillJsBundle\DTO\Modules\NodeMoverModule;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;
use Ehyiah\QuillJsBundle\DTO\Options\DebugOption;
use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Translation\TranslatableMessage;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\Config\QuillConfigBuilder
 */
final class QuillConfigBuilderTest extends TestCase
{
    private QuillConfigBuilder $builder;

    protected function setUp(): void
    {
        parent::setUp();

        $translator = $this->createMock(TranslatorInterface::class);
        $translator->method('trans')->willReturnArgument(0);

        $this->builder = new QuillConfigBuilder($translator);
    }

    /**
     * @covers ::build
     */
    public function testBuildWithInlineFields(): void
    {
        $config = $this->builder->build(
            fields: [
                [new BoldField(), new ItalicField()],
            ],
            modules: [],
            extraOptions: [],
        );

        $this->assertSame([['bold', 'italic']], $config->toolbarConfig);
    }

    /**
     * @covers ::build
     */
    public function testBuildWithBlockFields(): void
    {
        $config = $this->builder->build(
            fields: [
                [new HeaderField(HeaderField::HEADER_OPTION_1)],
            ],
            modules: [],
            extraOptions: [],
        );

        $this->assertSame([[['header' => 1]]], $config->toolbarConfig);
    }

    /**
     * @covers ::build
     */
    public function testBuildWithMultipleGroups(): void
    {
        $config = $this->builder->build(
            fields: [
                [new BoldField(), new ItalicField()],
                [new UnderlineField()],
            ],
            modules: [],
            extraOptions: [],
        );

        $this->assertSame([['bold', 'italic'], ['underline']], $config->toolbarConfig);
    }

    /**
     * @covers ::build
     */
    public function testBuildWithRawStringFields(): void
    {
        $config = $this->builder->build(
            fields: [
                ['bold', 'italic'],
            ],
            modules: [],
            extraOptions: [],
        );

        $this->assertSame([['bold', 'italic']], $config->toolbarConfig);
    }

    /**
     * @covers ::build
     */
    public function testBuildAutoImportsModulesFromFields(): void
    {
        $config = $this->builder->build(
            fields: [
                [new CodeBlockField()],
            ],
            modules: [],
            extraOptions: [],
        );

        $moduleNames = array_map(static fn ($m) => $m->name, $config->modules);
        $this->assertContains(SyntaxModule::NAME, $moduleNames);
    }

    /**
     * @covers ::build
     */
    public function testBuildSkipsAlreadyPresentModule(): void
    {
        $config = $this->builder->build(
            fields: [
                [new CodeBlockField()],
            ],
            modules: [
                new SyntaxModule(),
            ],
            extraOptions: [],
        );

        $syntaxModules = array_filter(
            $config->modules,
            static fn ($m) => $m instanceof SyntaxModule,
        );
        $this->assertCount(1, $syntaxModules);
    }

    /**
     * @covers ::build
     */
    public function testBuildAddsNodeMoverWhenMissing(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: [],
        );

        $this->assertContainsOnlyInstancesOf(NodeMoverModule::class, $config->modules);
    }

    /**
     * @covers ::build
     */
    public function testBuildKeepsExistingNodeMover(): void
    {
        $existing = new NodeMoverModule(options: ['borderColor' => 'red']);

        $config = $this->builder->build(
            fields: [],
            modules: [$existing],
            extraOptions: [],
        );

        $this->assertCount(1, $config->modules);
        $this->assertSame($existing, $config->modules[0]);
    }

    /**
     * @covers ::build
     */
    public function testBuildRemovesNodeMoverWhenExplicitlyDisabled(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [
                new NodeMoverModule(options: ['active' => false]),
            ],
            extraOptions: [],
        );

        $this->assertEmpty($config->modules);
    }

    /**
     * @covers ::build
     */
    public function testBuildResolvesExtraOptionsDefaults(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: [],
        );

        $this->assertSame('error', $config->extraOptions['debug']);
        $this->assertSame('200px', $config->extraOptions['height']);
        $this->assertSame('snow', $config->extraOptions['theme']);
        $this->assertSame('Quill editor', $config->extraOptions['placeholder']);
        $this->assertSame('class', $config->extraOptions['style']);
        $this->assertFalse($config->extraOptions['use_semantic_html']);
        $this->assertFalse($config->extraOptions['read_only']);
        $this->assertSame([], $config->extraOptions['custom_icons']);
        $this->assertSame([], $config->extraOptions['modules']);
        $this->assertSame([], $config->extraOptions['assets']);
    }

    /**
     * @covers ::build
     */
    public function testBuildMergesExtraOptions(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: [
                'height' => '500px',
                'theme' => 'bubble',
                'placeholder' => 'Write something...',
                'read_only' => true,
            ],
        );

        $this->assertSame('500px', $config->extraOptions['height']);
        $this->assertSame('bubble', $config->extraOptions['theme']);
        $this->assertSame('Write something...', $config->extraOptions['placeholder']);
        $this->assertTrue($config->extraOptions['read_only']);
        $this->assertSame('error', $config->extraOptions['debug']); // unchanged default
    }

    /**
     * @covers ::build
     */
    public function testBuildWithCallableExtraOptions(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: static function (\Symfony\Component\OptionsResolver\OptionsResolver $resolver): void {
                $resolver->setDefault('height', '700px');
            },
        );

        $this->assertSame('700px', $config->extraOptions['height']);
    }

    /**
     * @covers ::build
     */
    public function testBuildTranslatesTranslatableMessagePlaceholder(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: [
                'placeholder' => new TranslatableMessage('Votre texte'),
            ],
        );

        $this->assertSame('Votre texte', $config->extraOptions['placeholder']);
    }

    /**
     * @covers ::build
     */
    public function testBuildExtractsCustomAssets(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: [
                'assets' => [
                    'styleSheets' => [
                        'custom' => 'https://example.com/custom.css',
                    ],
                    'scripts' => [
                        'custom' => 'https://example.com/custom.js',
                    ],
                ],
            ],
        );

        $this->assertSame(['custom' => 'https://example.com/custom.css'], $config->assets['styleSheets']);
        $this->assertSame(['custom' => 'https://example.com/custom.js'], $config->assets['scripts']);
    }

    /**
     * @covers ::build
     */
    public function testBuildWithEmptyAssets(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: [],
        );

        $this->assertSame([], $config->assets['styleSheets']);
        $this->assertSame([], $config->assets['scripts']);
    }

    /**
     * @covers ::build
     */
    public function testBuildWithSingleFieldNotWrappedInArray(): void
    {
        $config = $this->builder->build(
            fields: [new BoldField()],
            modules: [],
            extraOptions: [],
        );

        $this->assertSame(['bold'], $config->toolbarConfig);
    }

    /**
     * @covers ::build
     */
    public function testBuildWithUploadHandlerConfig(): void
    {
        $config = $this->builder->build(
            fields: [],
            modules: [],
            extraOptions: [
                'upload_handler' => [
                    'type' => 'json',
                    'upload_endpoint' => 'https://example.com/upload',
                    'json_response_file_path' => 'data.url',
                    'security' => [
                        'type' => 'jwt',
                        'jwt_token' => 'my-token',
                    ],
                ],
            ],
        );

        $upload = $config->extraOptions['upload_handler'];
        $this->assertSame('json', $upload['type']);
        $this->assertSame('https://example.com/upload', $upload['upload_endpoint']);
        $this->assertSame('data.url', $upload['json_response_file_path']);
        $this->assertSame('jwt', $upload['security']['type']);
        $this->assertSame('my-token', $upload['security']['jwt_token']);
    }
}
