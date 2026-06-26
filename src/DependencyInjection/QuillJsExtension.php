<?php

namespace Ehyiah\QuillJsBundle\DependencyInjection;

use Ehyiah\QuillJsBundle\Config\QuillConfigBuilder;
use Ehyiah\QuillJsBundle\Form\QuillAdminField;
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\Twig\Components\QuillContent;
use Ehyiah\QuillJsBundle\Twig\QuillContentExtension;
use Symfony\Component\AssetMapper\AssetMapperInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Reference;
use Symfony\Contracts\Translation\TranslatorInterface;

class QuillJsExtension extends Extension implements PrependExtensionInterface
{
    public function prepend(ContainerBuilder $container): void
    {
        // Register the QuillJS form theme if TwigBundle is available
        $bundles = $container->getParameter('kernel.bundles');

        if (is_array($bundles) && isset($bundles['TwigBundle'])) {
            $container->prependExtensionConfig('twig', [
                'form_themes' => ['@QuillJs/form.html.twig'],
                'paths' => [
                    __DIR__ . '/../templates' => 'QuillJs',
                ],
            ]);
        }

        if ($this->isAssetMapperAvailable($container)) {
            $container->prependExtensionConfig('framework', [
                'asset_mapper' => [
                    'paths' => [
                        __DIR__ . '/../../assets/dist' => '@ehyiah/ux-quill/dist',
                    ],
                ],
            ]);
        }
    }

    public function load(array $configs, ContainerBuilder $container): void
    {
        $builderDefinition = new Definition(QuillConfigBuilder::class);
        $builderDefinition->setArgument('$translator', new Reference(TranslatorInterface::class));
        $builderDefinition->setPublic(false);
        $container->setDefinition('quill_js.config_builder', $builderDefinition);
        $container->setAlias(QuillConfigBuilder::class, 'quill_js.config_builder')->setPublic(false);

        $typeDefinition = new Definition(QuillType::class);
        $typeDefinition->setArgument('$configBuilder', new Reference('quill_js.config_builder'));
        $typeDefinition->addTag('form.type');
        $typeDefinition->setPublic(false);
        $container->setDefinition('form.ux-quill-js', $typeDefinition);

        if (class_exists('Symfony\UX\TwigComponent\Attribute\AsTwigComponent')) {
            $definition = new Definition(QuillContent::class);
            $definition->addTag('twig.component', [
                'key' => 'QuillContent',
                'template' => '@QuillJs/components/QuillContent.html.twig',
            ]);
            $container->setDefinition('quill_js.twig_component.quill_content', $definition);
        }

        $extensionDefinition = new Definition(QuillContentExtension::class);
        $extensionDefinition->addTag('twig.extension');
        $extensionDefinition->setPublic(false);
        if (interface_exists(AssetMapperInterface::class)) {
            $extensionDefinition->setArgument('$assetMapper', new Reference(AssetMapperInterface::class, ContainerBuilder::IGNORE_ON_INVALID_REFERENCE));
        }
        $container->setDefinition('quill_js.twig_extension.quill_content', $extensionDefinition);

        $bundles = $container->getParameter('kernel.bundles');

        if (is_array($bundles) && isset($bundles['EasyAdminBundle'])) {
            $container
                ->setDefinition('form.ux-quill-js-admin', new Definition(QuillAdminField::class))
                ->addTag('form.type_admin')
                ->setPublic(false)
            ;
        }
    }

    private function isAssetMapperAvailable(ContainerBuilder $container): bool
    {
        if (!interface_exists(AssetMapperInterface::class)) {
            return false;
        }
        $bundlesMetadata = $container->getParameter('kernel.bundles_metadata');
        if (!is_array($bundlesMetadata)) {
            return false;
        }

        // check that FrameworkBundle 6.3 or higher is installed
        if (!isset($bundlesMetadata['FrameworkBundle'])) {
            return false;
        }

        return is_file($bundlesMetadata['FrameworkBundle']['path'] . '/Resources/config/asset_mapper.php');
    }
}
