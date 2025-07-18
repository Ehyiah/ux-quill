<?php

namespace Ehyiah\QuillJsBundle\Tests\Functional;

use Ehyiah\QuillJsBundle\DTO\Modules\EmojiModule;
use Ehyiah\QuillJsBundle\DTO\Modules\ResizeModule;
use Ehyiah\QuillJsBundle\DTO\Modules\SyntaxModule;
use Ehyiah\QuillJsBundle\DTO\Options\ThemeOption;
use Ehyiah\QuillJsBundle\Form\QuillType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\Forms;

/**
 * @coversNothing
 */
final class FormTypeTest extends TestCase
{
    private FormFactoryInterface $formFactory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->formFactory = Forms::createFormFactoryBuilder()
            ->getFormFactory()
        ;
    }

    public function testCreateBasicQuillForm(): void
    {
        $form = $this->formFactory->createBuilder()
            ->add('content', QuillType::class)
            ->getForm()
        ;

        $this->assertNotNull($form);
        $this->assertTrue($form->has('content'));

        $contentField = $form->get('content');
        $this->assertInstanceOf('\Symfony\Component\Form\FormInterface', $contentField);

        $formView = $form->createView();

        $this->assertArrayHasKey('content', $formView->children);

        $contentView = $formView->children['content'];
        $this->assertTrue(in_array('quill', $contentView->vars['block_prefixes'], true));
    }

    public function testCreateQuillFormWithCustomOptions(): void
    {
        $customOptions = [
            'quill_options' => [
                ['bold', 'italic', 'underline'],
                ['image'],
                ['code-block'],
            ],
            'quill_extra_options' => [
                'theme' => ThemeOption::QUILL_THEME_SNOW,
                'placeholder' => 'Éditeur de texte riche',
                'height' => '300px',
            ],
            'modules' => [
                new EmojiModule(),
                new SyntaxModule(),
            ],
        ];

        $form = $this->formFactory->createBuilder()
            ->add('content', QuillType::class, $customOptions)
            ->getForm()
        ;

        $formView = $form->createView();
        $contentView = $formView->children['content'];

        $this->assertArrayHasKey('attr', $contentView->vars);
        $this->assertArrayHasKey('quill_options', $contentView->vars['attr']);
        $this->assertArrayHasKey('quill_extra_options', $contentView->vars['attr']);
        $this->assertArrayHasKey('quill_modules_options', $contentView->vars['attr']);

        $quillOptions = json_decode($contentView->vars['attr']['quill_options'], true);
        $this->assertIsArray($quillOptions);
        $this->assertContains(['bold', 'italic', 'underline'], $quillOptions);

        $extraOptions = json_decode($contentView->vars['attr']['quill_extra_options'], true);
        $this->assertEquals(ThemeOption::QUILL_THEME_SNOW, $extraOptions['theme']);
        $this->assertEquals('Éditeur de texte riche', $extraOptions['placeholder']);
        $this->assertEquals('300px', $extraOptions['height']);

        $modulesOptions = json_decode($contentView->vars['attr']['quill_modules_options'], true);
        $this->assertIsArray($modulesOptions);

        $moduleNames = array_column($modulesOptions, 'name');
        $this->assertContains(EmojiModule::NAME, $moduleNames);
        $this->assertContains(SyntaxModule::NAME, $moduleNames);

        $this->assertContains(ResizeModule::NAME, $moduleNames);
    }

    public function testFormSubmission(): void
    {
        $form = $this->formFactory->createBuilder()
            ->add('content', QuillType::class)
            ->getForm()
        ;

        $htmlContent = '<p>Voici un <strong>texte</strong> de test avec du <em>formatage</em>.</p>';
        $formData = ['content' => $htmlContent];

        $form->submit($formData);

        $this->assertTrue($form->isValid());
        $this->assertTrue($form->isSynchronized());

        $data = $form->getData();

        $this->assertArrayHasKey('content', $data);
        $this->assertEquals($htmlContent, $data['content']);
    }
}
