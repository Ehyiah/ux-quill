<?php

namespace Ehyiah\QuillJsBundle\Form;

use EasyCorp\Bundle\EasyAdminBundle\Contracts\Field\FieldInterface;
use EasyCorp\Bundle\EasyAdminBundle\Field\FieldTrait;

class QuillAdminField implements FieldInterface
{
    use FieldTrait;

    /**
     * @param string|false|null $label
     */
    public static function new(string $propertyName, $label = null): self
    {
        return (new self())
            ->addFormTheme('@QuillJs/form.html.twig', '@EasyAdmin/crud/form_theme.html.twig')
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setTemplatePath('form.html.twig')
            ->setFormType(QuillType::class)
            ->addWebpackEncoreEntries('quill')
        ;
    }
}
