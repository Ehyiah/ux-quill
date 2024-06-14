<?php

namespace Ehyiah\QuillJsBundle\Tests\Form;

use Ehyiah\QuillJsBundle\DTO\Options\Modules\EmojiModule;
use Ehyiah\QuillJsBundle\DTO\Options\Modules\ResizeModule;
use Ehyiah\QuillJsBundle\Form\QuillType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

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

        $this->quillType = new QuillType();
        $this->form = $this->createMock(FormInterface::class);
        $this->formView = new FormView();
    }

    /**
     * @covers ::buildView
     */
    public function testBuildView(): void
    {
        $options = [
            'quill_options' => [
                ['bold', 'italic'],
                ['bold', 'underline'],
            ],
            'quill_extra_options' => [
                'sanitizer' => 'some_sanitizer',
                'modules' => [
                ],
            ],
        ];

        $expectedOptions = [
            'quill_options' => [
                ['bold', 'italic'],
                ['bold', 'underline'],
            ],
            'quill_extra_options' => [
                'sanitizer' => 'some_sanitizer',
                'modules' => [
                    new EmojiModule(),
                    new ResizeModule(),
                ],
            ],
        ];

        $this->quillType->buildView($this->formView, $this->form, $options);

        $this->assertArrayHasKey('attr', $this->formView->vars);
        $this->assertArrayHasKey('quill_options', $this->formView->vars['attr']);
        $this->assertArrayHasKey('quill_extra_options', $this->formView->vars['attr']);
        $this->assertArrayHasKey('sanitizer', $this->formView->vars['attr']);

        $this->assertEquals(json_encode($expectedOptions['quill_options']), $this->formView->vars['attr']['quill_options']);
        $this->assertEquals(json_encode($expectedOptions['quill_extra_options']), $this->formView->vars['attr']['quill_extra_options']);
        $this->assertEquals($expectedOptions['quill_extra_options']['sanitizer'], $this->formView->vars['attr']['sanitizer']);
    }

    /**
     * @covers ::configureOptions
     */
    public function testConfigureOptions(): void
    {
        $quillType = new QuillType();

        $resolver = new OptionsResolver();
        $quillType->configureOptions($resolver);

        $this->assertTrue($resolver->hasDefault('sanitize_html'));
        $this->assertTrue($resolver->hasDefault('error_bubbling'));
        $this->assertTrue($resolver->hasDefault('quill_options'));
        $this->assertTrue($resolver->hasDefault('quill_extra_options'));
    }

    /**
     * @covers ::getBlockPrefix
     */
    public function testGetBlockPrefix(): void
    {
        $quillType = new QuillType();

        $this->assertEquals('quill', $quillType->getBlockPrefix());
    }

    /**
     * @covers ::getParent
     */
    public function testGetParent(): void
    {
        $quillType = new QuillType();

        $this->assertEquals(TextareaType::class, $quillType->getParent());
    }
}
