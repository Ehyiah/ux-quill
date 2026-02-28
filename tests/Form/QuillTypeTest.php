<?php

namespace Ehyiah\QuillJsBundle\Tests\Form;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\BoldField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\CodeBlockField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\EmojiField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\FormulaField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ItalicField;
use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\UnderlineField;
use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ImageSelectionModule;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;
use Ehyiah\QuillJsBundle\Form\QuillType;
use Generator;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\Form\QuillType
 */
final class QuillTypeTest extends TestCase
{
    private QuillType $quillType;
    private FormInterface $form;
    private FormView $formView;

    protected function setUp(): void
    {
        parent::setUp();

        $translator = $this->createMock(TranslatorInterface::class);
        $this->quillType = new QuillType($translator);
        $this->form = $this->createMock(FormInterface::class);
        $this->formView = new FormView();
    }

    /**
     * @covers ::buildView
     *
     * @dataProvider provideOptionsToBuildView
     */
    public function testBuildView($options, $expectedOptions): void
    {
        $this->quillType->buildView($this->formView, $this->form, $options);

        $this->assertCount(3, $this->formView->vars);
        $this->assertArrayHasKey('attr', $this->formView->vars);
        $this->assertArrayHasKey('quill_assets', $this->formView->vars);
        $this->assertCount(2, $this->formView->vars['quill_assets']);
        $this->assertArrayHasKey('styleSheets', $this->formView->vars['quill_assets']);
        $this->assertArrayHasKey('scripts', $this->formView->vars['quill_assets']);
        $this->assertCount(3, $this->formView->vars['attr']);
        $this->assertArrayHasKey('quill_options', $this->formView->vars['attr']);
        $this->assertArrayHasKey('quill_extra_options', $this->formView->vars['attr']);
        $this->assertArrayHasKey('quill_modules_options', $this->formView->vars['attr']);

        $this->assertEquals(json_encode($expectedOptions['quill_options']), $this->formView->vars['attr']['quill_options']);
        $this->assertEquals(json_encode($expectedOptions['quill_extra_options']), $this->formView->vars['attr']['quill_extra_options']);
        $this->assertEquals(json_encode($expectedOptions['modules']), $this->formView->vars['attr']['quill_modules_options']);
    }

    public static function provideOptionsToBuildView(): Generator
    {
        yield [
            [
                'quill_options' => [
                    [new BoldField(), new ItalicField()],
                    [new BoldField(), new UnderlineField()],
                    [new CodeBlockField()],
                    [new ImageField()],
                    [new EmojiField()],
                ],
                'quill_extra_options' => [
                ],
                'modules' => [],
            ],
            [
                'quill_options' => [
                    ['bold', 'italic'],
                    ['bold', 'underline'],
                    ['code-block'],
                    ['image'],
                    ['emoji'],
                ],
                'quill_extra_options' => [
                ],
                'modules' => [
                    new SyntaxModule(),
                    new ImageSelectionModule(),
                    new EmojiModule(),
                ],
            ],
        ];
        yield [
            [
                'quill_options' => [
                    [new BoldField(), new ItalicField()],
                    [new BoldField(), new UnderlineField()],
                ],
                'quill_extra_options' => [
                ],
                'modules' => [],
            ],
            [
                'quill_options' => [
                    ['bold', 'italic'],
                    ['bold', 'underline'],
                ],
                'quill_extra_options' => [
                ],
                'modules' => [
                ],
            ],
        ];
    }

    /**
     * @covers ::configureOptions
     */
    public function testConfigureOptions(): void
    {
        $translator = $this->createMock(TranslatorInterface::class);
        $quillType = new QuillType($translator);

        $resolver = new OptionsResolver();
        $quillType->configureOptions($resolver);

        $this->assertCount(5, $resolver->getDefinedOptions());
        $this->assertTrue($resolver->hasDefault('label'));
        $this->assertTrue($resolver->hasDefault('error_bubbling'));
        $this->assertTrue($resolver->hasDefault('quill_options'));
        $this->assertTrue($resolver->hasDefault('quill_extra_options'));
        $this->assertTrue($resolver->hasDefault('modules'));
    }

    /**
     * @covers ::getBlockPrefix
     */
    public function testGetBlockPrefix(): void
    {
        $translator = $this->createMock(TranslatorInterface::class);
        $quillType = new QuillType($translator);

        $this->assertEquals('quill', $quillType->getBlockPrefix());
    }

    /**
     * @covers ::getParent
     */
    public function testGetParent(): void
    {
        $translator = $this->createMock(TranslatorInterface::class);
        $quillType = new QuillType($translator);

        $this->assertEquals(TextareaType::class, $quillType->getParent());
    }

    /**
     * @covers ::buildView
     */
    public function testBuildViewWithDefaultQuillExtraOptionsAsClosure(): void
    {
        $resolver = new OptionsResolver();
        $this->quillType->configureOptions($resolver);

        // Resolve options without providing quill_extra_options (uses default closure)
        $options = $resolver->resolve([
            'quill_options' => [['bold', 'italic']],
            'modules' => [],
        ]);

        $this->quillType->buildView($this->formView, $this->form, $options);

        $this->assertArrayHasKey('attr', $this->formView->vars);
        $this->assertArrayHasKey('quill_extra_options', $this->formView->vars['attr']);

        $extraOptions = json_decode($this->formView->vars['attr']['quill_extra_options'], true);
        $this->assertIsArray($extraOptions);
        $this->assertArrayHasKey('debug', $extraOptions);
        $this->assertArrayHasKey('height', $extraOptions);
        $this->assertArrayHasKey('theme', $extraOptions);
        $this->assertArrayHasKey('placeholder', $extraOptions);
        $this->assertEquals('error', $extraOptions['debug']);
        $this->assertEquals('200px', $extraOptions['height']);
        $this->assertEquals('snow', $extraOptions['theme']);
        $this->assertEquals('Quill editor', $extraOptions['placeholder']);
    }

    /**
     * @covers ::buildView
     *
     * @dataProvider provideCustomAssetsOptions
     */
    public function testBuildViewWithCustomAssets(
        array $options,
        array $expectedStyleSheets,
        array $expectedScripts,
        string $testCase,
    ): void {
        $this->quillType->buildView($this->formView, $this->form, $options);

        $this->assertArrayHasKey('quill_assets', $this->formView->vars, "Failed for test case: {$testCase}");
        $assets = $this->formView->vars['quill_assets'];

        $this->assertArrayHasKey('styleSheets', $assets, "Failed for test case: {$testCase}");
        $this->assertArrayHasKey('scripts', $assets, "Failed for test case: {$testCase}");

        $this->assertCount(
            count($expectedStyleSheets),
            $assets['styleSheets'],
            "StyleSheets count mismatch for test case: {$testCase}. Expected: " . json_encode($expectedStyleSheets) . ', Got: ' . json_encode($assets['styleSheets'])
        );

        foreach ($expectedStyleSheets as $key => $expectedUrl) {
            $this->assertArrayHasKey($key, $assets['styleSheets'], "Stylesheet '{$key}' missing for test case: {$testCase}");
            $this->assertEquals(
                $expectedUrl,
                $assets['styleSheets'][$key],
                "Stylesheet '{$key}' URL mismatch for test case: {$testCase}"
            );
        }

        $this->assertCount(
            count($expectedScripts),
            $assets['scripts'],
            "Scripts count mismatch for test case: {$testCase}. Expected: " . json_encode($expectedScripts) . ', Got: ' . json_encode($assets['scripts'])
        );

        foreach ($expectedScripts as $key => $expectedUrl) {
            $this->assertArrayHasKey($key, $assets['scripts'], "Script '{$key}' missing for test case: {$testCase}");
            $this->assertEquals(
                $expectedUrl,
                $assets['scripts'][$key],
                "Script '{$key}' URL mismatch for test case: {$testCase}"
            );
        }
    }

    public static function provideCustomAssetsOptions(): Generator
    {
        yield 'no custom assets' => [
            [
                'quill_options' => [[new BoldField(), new ItalicField()]],
                'quill_extra_options' => [],
                'modules' => [],
            ],
            [], // expected styleSheets
            [], // expected scripts
            'no custom assets',
        ];

        yield 'empty custom assets array' => [
            [
                'quill_options' => [[new BoldField(), new ItalicField()]],
                'quill_extra_options' => [
                    'assets' => [],
                ],
                'modules' => [],
            ],
            [],
            [],
            'empty custom assets array',
        ];

        yield 'custom stylesheets only' => [
            [
                'quill_options' => [[new BoldField(), new ItalicField()]],
                'quill_extra_options' => [
                    'assets' => [
                        'styleSheets' => [
                            'custom1' => 'https://example.com/custom1.css',
                            'custom2' => 'https://example.com/custom2.css',
                        ],
                    ],
                ],
                'modules' => [],
            ],
            [
                'custom1' => 'https://example.com/custom1.css',
                'custom2' => 'https://example.com/custom2.css',
            ],
            [],
            'custom stylesheets only',
        ];

        yield 'custom scripts only' => [
            [
                'quill_options' => [[new BoldField(), new ItalicField()]],
                'quill_extra_options' => [
                    'assets' => [
                        'scripts' => [
                            'custom1' => 'https://example.com/custom1.js',
                            'custom2' => 'https://example.com/custom2.js',
                        ],
                    ],
                ],
                'modules' => [],
            ],
            [],
            [
                'custom1' => 'https://example.com/custom1.js',
                'custom2' => 'https://example.com/custom2.js',
            ],
            'custom scripts only',
        ];

        yield 'custom stylesheets and scripts' => [
            [
                'quill_options' => [[new BoldField(), new ItalicField()]],
                'quill_extra_options' => [
                    'assets' => [
                        'styleSheets' => [
                            'customCss' => 'https://example.com/custom.css',
                        ],
                        'scripts' => [
                            'customJs' => 'https://example.com/custom.js',
                        ],
                    ],
                ],
                'modules' => [],
            ],
            [
                'customCss' => 'https://example.com/custom.css',
            ],
            [
                'customJs' => 'https://example.com/custom.js',
            ],
            'custom stylesheets and scripts',
        ];

        yield 'custom assets combined with built-in formula assets' => [
            [
                'quill_options' => [
                    [new BoldField(), new ItalicField()],
                    [new FormulaField()],
                ],
                'quill_extra_options' => [
                    'assets' => [
                        'styleSheets' => [
                            'custom' => 'https://example.com/custom.css',
                        ],
                        'scripts' => [
                            'custom' => 'https://example.com/custom.js',
                        ],
                    ],
                ],
                'modules' => [],
            ],
            [
                'custom' => 'https://example.com/custom.css',
            ],
            [
                'custom' => 'https://example.com/custom.js',
            ],
            'custom assets combined with built-in formula assets',
        ];
    }
}
