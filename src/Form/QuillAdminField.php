<?php

namespace Ehyiah\QuillJsBundle\Form;

use EasyCorp\Bundle\EasyAdminBundle\Contracts\Field\FieldInterface;
use EasyCorp\Bundle\EasyAdminBundle\Dto\FieldDto;
use EasyCorp\Bundle\EasyAdminBundle\Field\FieldTrait;
use InvalidArgumentException;
use LogicException;
use Symfony\Component\AssetMapper\AssetMapperInterface;

class QuillAdminField implements FieldInterface
{
    use FieldTrait;

    public const ASSETS_MODE_AUTO = 'auto';
    public const ASSETS_MODE_REPRISE = 'reprise';
    public const ASSETS_MODE_ASSET_MAPPER = 'asset_mapper';
    public const ASSETS_MODE_WEBPACK_ENCORE = 'webpack_encore';
    public const ASSETS_MODE_NONE = 'none';

    public const OPTION_ASSETS_MODE = 'quill_assets_mode';

    private const ENTRY_NAME = 'quill-admin';

    private const ASSETS_MODES = [
        self::ASSETS_MODE_AUTO,
        self::ASSETS_MODE_REPRISE,
        self::ASSETS_MODE_ASSET_MAPPER,
        self::ASSETS_MODE_WEBPACK_ENCORE,
        self::ASSETS_MODE_NONE,
    ];

    private bool $assetsRegistered = false;

    /**
     * @param string|false|null $label
     */
    public static function new(string $propertyName, $label = null): self
    {
        return (new self())
            ->addFormTheme('@QuillJs/form.html.twig', '@EasyAdmin/crud/form_theme.html.twig')
            ->setProperty($propertyName)
            ->setLabel($label)
            ->setFormType(QuillType::class)
        ;
    }

    /**
     * Forces the asset toolchain used to register the "quill-admin" entry.
     *
     * Leave it untouched to auto-detect the toolchain (Symfony Reprise, then
     * AssetMapper, then Webpack Encore). Use "none" when the entry is
     * registered by the application in configureAssets().
     */
    public function withAssetsMode(string $mode): self
    {
        if ($this->assetsRegistered) {
            throw new LogicException('The assets mode must be set before the field is converted to a DTO.');
        }

        $this->setCustomOption(self::OPTION_ASSETS_MODE, self::assertAssetsMode($mode));

        return $this;
    }

    /**
     * Registers the "quill-admin" entry when EasyAdmin converts the field to a DTO.
     *
     * The registration is deferred to this method so the assets mode set on the
     * field (see withAssetsMode()) is known.
     */
    public function getAsDto(): FieldDto
    {
        if ($this->assetsRegistered) {
            return $this->dto;
        }

        $mode = $this->resolveConfiguredAssetsMode();

        if (self::ASSETS_MODE_NONE !== $mode) {
            $this->{self::assetsMethodFor($mode)}(self::ENTRY_NAME);
        }

        $this->assetsRegistered = true;

        return $this->dto;
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

    private function resolveConfiguredAssetsMode(): string
    {
        $mode = $this->dto->getCustomOption(self::OPTION_ASSETS_MODE);

        if (null === $mode || self::ASSETS_MODE_AUTO === $mode) {
            return self::resolveAssetsMode();
        }

        return self::assertAssetsMode($mode);
    }

    private static function assertAssetsMode(mixed $mode): string
    {
        if (!\is_string($mode) || !\in_array($mode, self::ASSETS_MODES, true)) {
            throw new InvalidArgumentException(sprintf('Unknown assets mode "%s". Allowed values are: %s.', \is_string($mode) ? $mode : get_debug_type($mode), implode(', ', self::ASSETS_MODES)));
        }

        return $mode;
    }

    private static function assetsMethodFor(string $mode): string
    {
        if (self::ASSETS_MODE_REPRISE === $mode && !method_exists(self::class, 'addRepriseEntries')) {
            throw new LogicException('The "reprise" assets mode requires EasyAdmin >= 5.3, which provides addRepriseEntries().');
        }

        return match ($mode) {
            self::ASSETS_MODE_REPRISE => 'addRepriseEntries',
            self::ASSETS_MODE_ASSET_MAPPER => 'addAssetMapperEntries',
            self::ASSETS_MODE_WEBPACK_ENCORE => 'addWebpackEncoreEntries',
            default => throw new InvalidArgumentException(sprintf('The "%s" assets mode does not register any entry.', $mode)),
        };
    }
}
