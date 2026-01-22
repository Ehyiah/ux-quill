<?php

namespace Ehyiah\QuillJsBundle\Tests\Form;

use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
use Ehyiah\QuillJsBundle\DTO\Modules\HtmlEditModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ResizeModule;
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
        if (isset($this->formView->vars['quill_assets']['styleSheets']['highlight'])) {
            $this->assertEquals('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css', $this->formView->vars['quill_assets']['styleSheets']['highlight']);
        }
        $this->assertArrayHasKey('scripts', $this->formView->vars['quill_assets']);
        if (isset($this->formView->vars['quill_assets']['scripts']['highlight'])) {
            $this->assertEquals('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js', $this->formView->vars['quill_assets']['scripts']['highlight']);
        }
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
                    ['bold', 'italic'],
                    ['bold', 'underline'],
                    ['code-block'],
                    ['image'],
                    ['emoji'],
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
                    new EmojiModule(),
                    new ResizeModule(),
                    new SyntaxModule(),
                ],
            ],
        ];
        yield [
            [
                'quill_options' => [
                    ['bold', 'italic'],
                    ['bold', 'underline'],
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
     *
     * @dataProvider provideFormulaFieldOptions
     */
    public function testBuildViewWithFormulaFieldAddsKatexAssets(array $options, string $testCase): void
    {
        $this->quillType->buildView($this->formView, $this->form, $options);

        $this->assertArrayHasKey('quill_assets', $this->formView->vars, "Failed for test case: {$testCase}");
        $this->assertArrayHasKey('styleSheets', $this->formView->vars['quill_assets'], "Failed for test case: {$testCase}");
        $this->assertArrayHasKey('scripts', $this->formView->vars['quill_assets'], "Failed for test case: {$testCase}");

        $this->assertArrayHasKey('katex', $this->formView->vars['quill_assets']['styleSheets'], "KaTeX stylesheet missing for test case: {$testCase}");
        $this->assertArrayHasKey('katex', $this->formView->vars['quill_assets']['scripts'], "KaTeX script missing for test case: {$testCase}");

        $this->assertEquals(
            'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
            $this->formView->vars['quill_assets']['styleSheets']['katex'],
            "Failed for test case: {$testCase}"
        );
        $this->assertEquals(
            'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
            $this->formView->vars['quill_assets']['scripts']['katex'],
            "Failed for test case: {$testCase}"
        );
    }

    public static function provideFormulaFieldOptions(): Generator
    {
        yield 'formula in array' => [
            [
                'quill_options' => [
                    ['bold', 'italic'],
                    ['formula', 'underline'],
                ],
                'quill_extra_options' => [],
                'modules' => [],
            ],
            'formula in array',
        ];

        yield 'formula as direct element' => [
            [
                'quill_options' => [
                    ['bold', 'italic'],
                    'formula',
                ],
                'quill_extra_options' => [],
                'modules' => [],
            ],
            'formula as direct element',
        ];
    }

    /**
     * @covers ::buildView
     *
     * @dataProvider provideModulesForHighlightAssets
     */
    public function testBuildViewWithSyntaxAndHtmlEditModulesHandlesHighlightAssets(
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

        foreach ($expectedStyleSheets as $key => $expectedUrl) {
            $this->assertArrayHasKey($key, $assets['styleSheets'], "Stylesheet '{$key}' missing for test case: {$testCase}");
            $this->assertEquals(
                $expectedUrl,
                $assets['styleSheets'][$key],
                "Stylesheet '{$key}' URL mismatch for test case: {$testCase}"
            );
        }

        foreach (array_keys($assets['styleSheets']) as $key) {
            $this->assertArrayHasKey($key, $expectedStyleSheets, "Unexpected stylesheet '{$key}' for test case: {$testCase}");
        }

        foreach ($expectedScripts as $key => $expectedUrl) {
            $this->assertArrayHasKey($key, $assets['scripts'], "Script '{$key}' missing for test case: {$testCase}");
            $this->assertEquals(
                $expectedUrl,
                $assets['scripts'][$key],
                "Script '{$key}' URL mismatch for test case: {$testCase}"
            );
        }

        foreach (array_keys($assets['scripts']) as $key) {
            $this->assertArrayHasKey($key, $expectedScripts, "Unexpected script '{$key}' for test case: {$testCase}");
        }
    }

    public static function provideModulesForHighlightAssets(): Generator
    {
        yield 'no modules at all' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [],
            ],
            [], // expected styleSheets
            [], // expected scripts
            'no modules at all',
        ];

        yield 'only SyntaxModule' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [new SyntaxModule()],
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
            ],
            'only SyntaxModule',
        ];

        yield 'only HtmlEditModule with syntax false' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [new HtmlEditModule()],
            ],
            [], // no highlight assets expected
            [],
            'only HtmlEditModule with syntax false',
        ];

        yield 'only HtmlEditModule with syntax true' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new HtmlEditModule(options: ['syntax' => true]),
                ],
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                'highlight2' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js',
            ],
            'only HtmlEditModule with syntax true',
        ];

        yield 'HtmlEditModule without syntax option' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new HtmlEditModule(options: ['debug' => true]),
                ],
            ],
            [], // no highlight assets expected (syntax defaults to false)
            [],
            'HtmlEditModule without syntax option',
        ];

        yield 'SyntaxModule before HtmlEditModule with syntax false' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new SyntaxModule(),
                    new HtmlEditModule(options: ['syntax' => false]),
                ],
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
            ],
            'SyntaxModule before HtmlEditModule with syntax false',
        ];

        yield 'SyntaxModule before HtmlEditModule with syntax true - HtmlEdit overwrites' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new SyntaxModule(),
                    new HtmlEditModule(options: ['syntax' => true]),
                ],
            ],
            [
                // HtmlEditModule overwrites the SyntaxModule stylesheet
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                'highlight2' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js',
            ],
            'SyntaxModule before HtmlEditModule with syntax true - HtmlEdit overwrites',
        ];

        yield 'HtmlEditModule with syntax true before SyntaxModule - SyntaxModule overwrites' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new HtmlEditModule(options: ['syntax' => true]),
                    new SyntaxModule(),
                ],
            ],
            [
                // SyntaxModule overwrites the HtmlEditModule stylesheet
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                'highlight2' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js',
            ],
            'HtmlEditModule with syntax true before SyntaxModule - SyntaxModule overwrites',
        ];

        yield 'multiple SyntaxModule instances' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new SyntaxModule(),
                    new SyntaxModule(),
                    new SyntaxModule(),
                ],
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
            ],
            'multiple SyntaxModule instances',
        ];

        yield 'multiple HtmlEditModule instances with different syntax values' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new HtmlEditModule(options: ['syntax' => false]),
                    new HtmlEditModule(options: ['syntax' => true]),
                    new HtmlEditModule(options: ['syntax' => false]),
                ],
            ],
            [
                // Last HtmlEditModule with syntax true wins
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                'highlight2' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js',
            ],
            'multiple HtmlEditModule instances with different syntax values',
        ];

        yield 'complex scenario with other modules' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [
                    new EmojiModule(),
                    new SyntaxModule(),
                    new ResizeModule(),
                    new HtmlEditModule(options: ['syntax' => true]),
                ],
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                'highlight2' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js',
            ],
            'complex scenario with other modules',
        ];
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
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [],
                'modules' => [],
            ],
            [], // expected styleSheets
            [], // expected scripts
            'no custom assets',
        ];

        yield 'empty custom assets array' => [
            [
                'quill_options' => [['bold', 'italic']],
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
                'quill_options' => [['bold', 'italic']],
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
                'quill_options' => [['bold', 'italic']],
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
                'quill_options' => [['bold', 'italic']],
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
                    ['bold', 'italic'],
                    ['formula'],
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
                'katex' => 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
                'custom' => 'https://example.com/custom.css',
            ],
            [
                'katex' => 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
                'custom' => 'https://example.com/custom.js',
            ],
            'custom assets combined with built-in formula assets',
        ];

        yield 'custom assets combined with SyntaxModule' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [
                    'assets' => [
                        'styleSheets' => [
                            'myTheme' => 'https://example.com/my-theme.css',
                        ],
                        'scripts' => [
                            'myPlugin' => 'https://example.com/my-plugin.js',
                        ],
                    ],
                ],
                'modules' => [new SyntaxModule()],
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css',
                'myTheme' => 'https://example.com/my-theme.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                'myPlugin' => 'https://example.com/my-plugin.js',
            ],
            'custom assets combined with SyntaxModule',
        ];

        yield 'custom assets overwriting built-in highlight from SyntaxModule' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [
                    'assets' => [
                        'styleSheets' => [
                            'highlight' => 'https://example.com/my-custom-highlight.css',
                        ],
                        'scripts' => [
                            'highlight' => 'https://example.com/my-custom-highlight.js',
                        ],
                    ],
                ],
                'modules' => [new SyntaxModule()],
            ],
            [
                // Custom assets overwrite built-in highlight because array_merge keeps last value for duplicate keys
                'highlight' => 'https://example.com/my-custom-highlight.css',
            ],
            [
                'highlight' => 'https://example.com/my-custom-highlight.js',
            ],
            'custom assets overwriting built-in highlight from SyntaxModule',
        ];

        yield 'custom assets with HtmlEditModule syntax true' => [
            [
                'quill_options' => [['bold', 'italic']],
                'quill_extra_options' => [
                    'assets' => [
                        'styleSheets' => [
                            'customHighlight' => 'https://example.com/highlight-theme.css',
                        ],
                        'scripts' => [
                            'highlight2' => 'https://example.com/custom-xml-lang.js',
                        ],
                    ],
                ],
                'modules' => [
                    new HtmlEditModule(options: ['syntax' => true]),
                ],
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
                'customHighlight' => 'https://example.com/highlight-theme.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                // Custom assets overwrite highlight2 from HtmlEditModule
                'highlight2' => 'https://example.com/custom-xml-lang.js',
            ],
            'custom assets with HtmlEditModule syntax true',
        ];

        yield 'complex scenario with all asset types' => [
            [
                'quill_options' => [
                    ['bold', 'italic'],
                    ['formula'],
                ],
                'quill_extra_options' => [
                    'assets' => [
                        'styleSheets' => [
                            'bootstrap' => 'https://cdn.example.com/bootstrap.css',
                            'custom' => 'https://example.com/custom.css',
                        ],
                        'scripts' => [
                            'jquery' => 'https://cdn.example.com/jquery.js',
                            'custom' => 'https://example.com/custom.js',
                        ],
                    ],
                ],
                'modules' => [
                    new SyntaxModule(),
                    new HtmlEditModule(options: ['syntax' => true]),
                ],
            ],
            [
                // HtmlEditModule overwrites SyntaxModule highlight stylesheet
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
                'katex' => 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
                'bootstrap' => 'https://cdn.example.com/bootstrap.css',
                'custom' => 'https://example.com/custom.css',
            ],
            [
                'highlight' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
                'highlight2' => 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js',
                'katex' => 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
                'jquery' => 'https://cdn.example.com/jquery.js',
                'custom' => 'https://example.com/custom.js',
            ],
            'complex scenario with all asset types',
        ];
    }
}
