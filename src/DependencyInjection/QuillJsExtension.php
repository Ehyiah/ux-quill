<?php

namespace Ehyiah\QuillJsBundle\DependencyInjection;

use Ehyiah\QuillJsBundle\Form\QuillAdminField;
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\Twig\Components\QuillContent;
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
                        __DIR__ . '/../../assets/dist' => '@ehyiah/ux-quill',
                    ],
                ],
            ]);
        }
    }

    public function load(array $configs, ContainerBuilder $container): void
    {
        $definition = new Definition(QuillType::class);
        $definition->setArgument('$translator', new Reference(TranslatorInterface::class));
        $definition->addTag('form.type');
        $definition->setPublic(false);

        $container->setDefinition('form.ux-quill-js', $definition);

        if (class_exists('Symfony\UX\TwigComponent\Attribute\AsTwigComponent')) {
            $definition = new Definition(QuillContent::class);
            $definition->addTag('twig.component', [
                'key' => 'QuillContent',
                'template' => '@QuillJs/components/QuillContent.html.twig',
            ]);
            $container->setDefinition('quill_js.twig_component.quill_content', $definition);
        }

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
