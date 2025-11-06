<?php

namespace Ehyiah\QuillJsBundle\Tests\Form;

use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
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
}
