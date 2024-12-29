<?php

namespace Ehyiah\QuillJsBundle\Form;

use EasyCorp\Bundle\EasyAdminBundle\Contracts\Field\FieldInterface;
use EasyCorp\Bundle\EasyAdminBundle\Field\FieldTrait;
use Symfony\Component\AssetMapper\AssetMapperInterface;

class QuillAdminField implements FieldInterface
{
    use FieldTrait;

    /**
     * @param string|false|null $label
     */
    public static function new(string $propertyName, $label = null): self
    {
        if (!interface_exists(AssetMapperInterface::class)) {
            return (new self())
                ->addFormTheme('@QuillJs/form.html.twig', '@EasyAdmin/crud/form_theme.html.twig')
                ->setProperty($propertyName)
                ->setLabel($label)
                ->setFormType(QuillType::class)
                ->addWebpackEncoreEntries('quill-admin')
            ;
        }

        return (new self())
            ->addFormTheme('@QuillJs/form.html.twig', '@EasyAdmin/crud/form_theme.html.twig')
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(QuillType::class)
            ->addAssetMapperEntries('quill-admin')
        ;
    }
}
