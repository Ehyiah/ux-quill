<?php

namespace Ehyiah\QuillJsBundle\DependencyInjection;

use Ehyiah\QuillJsBundle\Form\QuillAdminField;
use Ehyiah\QuillJsBundle\Form\QuillType;
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
            $container->prependExtensionConfig('twig', ['form_themes' => ['@QuillJs/form.html.twig']]);
        }

        // see https://github.com/symfony/symfony/issues/53912#issuecomment-2591275217
        // src/Resources/importmap.php
        //        '@acme/bundle/bundle.js' => [
        //        'path' => '@acme/bundle/bundle.js' // this maps to $bundleDir/assets/dist/bundle.js
        //    ],
        // '@acme/bundle/bundle.css' => [
        //        'path' => '@acme/bundle/bundle.css', // this maps to $bundleDir/assets/dist/bundle.css
        //        'type' => 'css' // this is important to avoid MIME Type error
        //    ]
        // ou mieux https://github.com/symfony/symfony/discussions/57952#discussioncomment-10310344
        // mettre dans le dossier public comme ca pas de soucis avec webpack ou assetmapper
        if ($this->isAssetMapperAvailable($container)) {
            $container->prependExtensionConfig('framework', [
                'asset_mapper' => [
                    'paths' => [
                        __DIR__ . '/../../assets/dist' => '@ehyiah/ux-quill',
                        __DIR__ . '/../../assets/src/styles' => '@ehyiah/ux-quill/styles',
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
