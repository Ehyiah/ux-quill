<?php

namespace Ehyiah\QuillJsBundle\DependencyInjection;

use Ehyiah\QuillJsBundle\Config\QuillConfigBuilder;
use Ehyiah\QuillJsBundle\Controller\SynonymController;
use Ehyiah\QuillJsBundle\DTO\Synonym\BabelNetSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\ConceptNetSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\BabelNetSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\ConceptNetSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\DatamuseSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\FreeDictionarySynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\OpenAiSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\Config\WordsApiSynonymConfig;
use Ehyiah\QuillJsBundle\DTO\Synonym\DatamuseSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\DummySynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\FreeDictionarySynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\OpenAiSynonymProvider;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderInterface;
use Ehyiah\QuillJsBundle\DTO\Synonym\SynonymProviderRegistry;
use Ehyiah\QuillJsBundle\DTO\Synonym\WordsApiSynonymProvider;
use Ehyiah\QuillJsBundle\Form\QuillAdminField;
use Ehyiah\QuillJsBundle\Form\QuillType;
use Ehyiah\QuillJsBundle\Twig\Components\QuillContent;
use Ehyiah\QuillJsBundle\Twig\QuillContentExtension;
use Symfony\Component\AssetMapper\AssetMapperInterface;
use Symfony\Component\DependencyInjection\Argument\TaggedIteratorArgument;
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

        // Register the synonym provider registry with tagged iterator
        $registryDefinition = new Definition(SynonymProviderRegistry::class);
        $registryDefinition->setArgument('$providers', new TaggedIteratorArgument('ux_quill.synonym_provider'));
        $registryDefinition->setPublic(false);
        $container->setDefinition('ux_quill.synonym_provider_registry', $registryDefinition);

        // Register the synonym controller
        $controllerDefinition = new Definition(SynonymController::class);
        $controllerDefinition->setArgument('$registry', new Reference('ux_quill.synonym_provider_registry'));
        $controllerDefinition->setArgument('$eventDispatcher', new Reference('event_dispatcher'));
        $controllerDefinition->addTag('controller.service_arguments');
        $controllerDefinition->setPublic(false);
        $container->setDefinition(SynonymController::class, $controllerDefinition);

        // Auto-tag all services implementing SynonymProviderInterface
        $container->registerForAutoconfiguration(SynonymProviderInterface::class)
            ->addTag('ux_quill.synonym_provider')
        ;

        // Register all Config DTOs as services
        $container->setDefinition(OpenAiSynonymConfig::class, (new Definition(OpenAiSynonymConfig::class))
            ->setArgument('$apiKey', '%env(default::QUILL_OPENAI_API_KEY)%')
            ->setArgument('$model', '%env(default::QUILL_OPENAI_MODEL)%')
            ->setArgument('$maxResults', '%env(default::QUILL_OPENAI_MAX_RESULTS)%')
            ->setArgument('$apiUrl', '%env(default::QUILL_OPENAI_API_URL)%')
        );
        $container->setDefinition(BabelNetSynonymConfig::class, (new Definition(BabelNetSynonymConfig::class))
            ->setArgument('$apiKey', '%env(default::QUILL_BABELNET_API_KEY)%')
        );
        $container->setDefinition(WordsApiSynonymConfig::class, (new Definition(WordsApiSynonymConfig::class))
            ->setArgument('$apiKey', '%env(default::QUILL_WORDSAPI_API_KEY)%')
        );
        $container->setDefinition(ConceptNetSynonymConfig::class, (new Definition(ConceptNetSynonymConfig::class))
            ->setAutowired(true)
        );
        $container->setDefinition(DatamuseSynonymConfig::class, (new Definition(DatamuseSynonymConfig::class))
            ->setAutowired(true)
        );
        $container->setDefinition(FreeDictionarySynonymConfig::class, (new Definition(FreeDictionarySynonymConfig::class))
            ->setAutowired(true)
        );

        // Auto-register all built-in providers (autowired + tagged)
        foreach ([
            DummySynonymProvider::class,
            ConceptNetSynonymProvider::class,
            DatamuseSynonymProvider::class,
            FreeDictionarySynonymProvider::class,
            BabelNetSynonymProvider::class,
            WordsApiSynonymProvider::class,
            OpenAiSynonymProvider::class,
        ] as $class) {
            $container->setDefinition($class, (new Definition($class))
                ->setAutowired(true)
                ->addTag('ux_quill.synonym_provider')
            );
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
