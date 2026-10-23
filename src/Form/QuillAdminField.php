<?php

namespace Ehyiah\QuillJsBundle\Form;

use EasyCorp\Bundle\EasyAdminBundle\Contracts\Field\FieldInterface;
use EasyCorp\Bundle\EasyAdminBundle\Field\FieldTrait;
use Symfony\Component\AssetMapper\AssetMapperInterface;

class QuillAdminField implements FieldInterface
{
    use FieldTrait;

    public const ASSETS_MODE_REPRISE = 'reprise';
    public const ASSETS_MODE_ASSET_MAPPER = 'asset_mapper';
    public const ASSETS_MODE_WEBPACK_ENCORE = 'webpack_encore';

    private const ENTRY_NAME = 'quill-admin';

    /**
     * @param string|false|null $label
     */
    public static function new(string $propertyName, $label = null): self
    {
        $field = (new self())
            ->addFormTheme('@QuillJs/form.html.twig', '@EasyAdmin/crud/form_theme.html.twig')
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(QuillType::class)
        ;

        $registerEntry = self::resolveAssetsMethod();

        return $field->{$registerEntry}(self::ENTRY_NAME);
    }

    /**
     * Resolves the EasyAdmin method registering the "quill-admin" entry, depending on
     * the asset toolchain used by the application.
     *
     * Symfony Reprise wins over AssetMapper and Webpack Encore: an application
     * bundling its assets with Vite or Rsbuild (Reprise) does not serve them
     * through the AssetMapper.
     *
     * Parameters are meant for tests, leave them to null to auto-detect.
     */
    public static function resolveAssetsMode(?bool $repriseInstalled = null, ?bool $assetMapperInstalled = null, ?bool $easyAdminSupportsReprise = null): string
    {
        $repriseInstalled ??= class_exists('Symfony\Reprise\RepriseBundle');
        $assetMapperInstalled ??= interface_exists(AssetMapperInterface::class);
        // EasyAdmin < 5.3 knows nothing about Reprise assets
        $easyAdminSupportsReprise ??= method_exists(self::class, 'addRepriseEntries');

        if ($repriseInstalled && $easyAdminSupportsReprise) {
            return self::ASSETS_MODE_REPRISE;
        }

        if ($assetMapperInstalled) {
            return self::ASSETS_MODE_ASSET_MAPPER;
        }

        return self::ASSETS_MODE_WEBPACK_ENCORE;
    }

    private static function resolveAssetsMethod(): string
    {
        return match (self::resolveAssetsMode()) {
            self::ASSETS_MODE_REPRISE => 'addRepriseEntries',
            self::ASSETS_MODE_ASSET_MAPPER => 'addAssetMapperEntries',
            default => 'addWebpackEncoreEntries',
        };
    }
}
