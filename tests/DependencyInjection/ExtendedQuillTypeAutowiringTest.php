<?php

namespace Ehyiah\QuillJsBundle\Tests\DependencyInjection;

use Ehyiah\QuillJsBundle\Config\QuillConfigBuilder;
use Ehyiah\QuillJsBundle\Form\QuillType;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Form\Forms;
use Symfony\Contracts\Translation\TranslatorInterface;

final class TextEditorType extends QuillType
{
}

/**
 * @covers \Ehyiah\QuillJsBundle\Form\QuillType
 */
final class ExtendedQuillTypeAutowiringTest extends TestCase
{
    public function testExtendedTypeCanBeInstantiatedWithConfigBuilder(): void
    {
        $translator = $this->createMock(TranslatorInterface::class);
        $configBuilder = new QuillConfigBuilder($translator);

        $type = new TextEditorType($configBuilder);

        $this->assertInstanceOf(QuillType::class, $type);
    }

    public function testExtendedTypeWorksInFormFactory(): void
    {
        $translator = $this->createMock(TranslatorInterface::class);
        $configBuilder = new QuillConfigBuilder($translator);

        $formFactory = Forms::createFormFactoryBuilder()
            ->addType(new TextEditorType($configBuilder))
            ->getFormFactory()
        ;

        $form = $formFactory->createBuilder()
            ->add('content', TextEditorType::class)
            ->getForm()
        ;

        $this->assertNotNull($form);
        $this->assertTrue($form->has('content'));

        $formView = $form->createView();
        $contentView = $formView->children['content'];

        $this->assertTrue(in_array('quill', $contentView->vars['block_prefixes'], true));
    }
}
