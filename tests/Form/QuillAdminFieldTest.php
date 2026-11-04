<?php

namespace Ehyiah\QuillJsBundle\Tests\Form;

use Ehyiah\QuillJsBundle\Form\QuillAdminField;
use Generator;
use InvalidArgumentException;
use LogicException;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Ehyiah\QuillJsBundle\Form\QuillAdminField
 */
final class QuillAdminFieldTest extends TestCase
{
    /**
     * @covers ::resolveAssetsMode
     *
     * @dataProvider provideAssetsModes
     */
    public function testResolveAssetsMode(bool $repriseInstalled, bool $assetMapperInstalled, bool $easyAdminSupportsReprise, string $expected): void
    {
        $this->assertSame(
            $expected,
            QuillAdminField::resolveAssetsMode($repriseInstalled, $assetMapperInstalled, $easyAdminSupportsReprise)
        );
    }

    public static function provideAssetsModes(): Generator
    {
        yield 'reprise only' => [
            true, false, true,
            QuillAdminField::ASSETS_MODE_REPRISE,
        ];

        yield 'reprise wins over asset mapper' => [
            true, true, true,
            QuillAdminField::ASSETS_MODE_REPRISE,
        ];

        yield 'asset mapper only' => [
            false, true, true,
            QuillAdminField::ASSETS_MODE_ASSET_MAPPER,
        ];

        yield 'webpack encore only' => [
            false, false, true,
            QuillAdminField::ASSETS_MODE_WEBPACK_ENCORE,
        ];

        yield 'reprise installed but EasyAdmin too old' => [
            true, false, false,
            QuillAdminField::ASSETS_MODE_WEBPACK_ENCORE,
        ];

        yield 'reprise installed but EasyAdmin too old, asset mapper available' => [
            true, true, false,
            QuillAdminField::ASSETS_MODE_ASSET_MAPPER,
        ];
    }

    /**
     * @covers ::new
     * @covers ::getAsDto
     */
    public function testNewRegistersTheEntryInTheDetectedToolchain(): void
    {
        $field = QuillAdminField::new('quill');

        // AssetMapper is installed in the bundle test environment, Reprise is not
        $this->assertArrayHasKey(
            'quill-admin',
            $field->getAsDto()->getAssets()->getAssetMapperAssets()
        );
    }

    /**
     * @covers ::withAssetsMode
     * @covers ::getAsDto
     */
    public function testWithAssetsModeForcesTheToolchain(): void
    {
        $field = QuillAdminField::new('quill')
            ->withAssetsMode(QuillAdminField::ASSETS_MODE_ASSET_MAPPER)
        ;

        $this->assertArrayHasKey(
            'quill-admin',
            $field->getAsDto()->getAssets()->getAssetMapperAssets()
        );
    }

    /**
     * @covers ::withAssetsMode
     * @covers ::getAsDto
     */
    public function testWithAssetsModeNoneSkipsTheEntryRegistration(): void
    {
        $field = QuillAdminField::new('quill')
            ->withAssetsMode(QuillAdminField::ASSETS_MODE_NONE)
        ;

        $assets = $field->getAsDto()->getAssets();

        $this->assertSame([], $assets->getAssetMapperAssets());
        $this->assertSame([], $assets->getWebpackEncoreAssets());
    }

    /**
     * @covers ::getAsDto
     */
    public function testAssetsModeCanBeSetThroughACustomOption(): void
    {
        $field = QuillAdminField::new('quill')
            ->setCustomOption(QuillAdminField::OPTION_ASSETS_MODE, QuillAdminField::ASSETS_MODE_NONE)
        ;

        $assets = $field->getAsDto()->getAssets();

        $this->assertSame([], $assets->getAssetMapperAssets());
        $this->assertSame([], $assets->getWebpackEncoreAssets());
    }

    /**
     * @covers ::withAssetsMode
     */
    public function testAnUnknownAssetsModeIsRejected(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Allowed values are: auto, reprise, asset_mapper, webpack_encore, none.');

        QuillAdminField::new('quill')->withAssetsMode('vite');
    }

    /**
     * @covers ::getAsDto
     */
    public function testAnUnknownAssetsModeSetThroughACustomOptionIsRejected(): void
    {
        $field = QuillAdminField::new('quill')
            ->setCustomOption(QuillAdminField::OPTION_ASSETS_MODE, 'vite')
        ;

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown assets mode "vite".');

        $field->getAsDto();
    }

    /**
     * @covers ::getAsDto
     */
    public function testGetAsDtoIsIdempotent(): void
    {
        $field = QuillAdminField::new('quill');

        $firstAssets = $field->getAsDto()->getAssets()->getAssetMapperAssets();
        $secondAssets = $field->getAsDto()->getAssets()->getAssetMapperAssets();

        $this->assertSame($firstAssets, $secondAssets);
        $this->assertCount(1, $secondAssets);
    }

    /**
     * @covers ::getAsDto
     */
    public function testTheRepriseAssetsModeRequiresEasyAdmin53(): void
    {
        if (method_exists(QuillAdminField::class, 'addRepriseEntries')) {
            $this->markTestSkipped('This EasyAdmin version supports Reprise assets.');
        }

        $field = QuillAdminField::new('quill')
            ->withAssetsMode(QuillAdminField::ASSETS_MODE_REPRISE)
        ;

        $this->expectException(LogicException::class);
        $this->expectExceptionMessage('requires EasyAdmin >= 5.3');

        $field->getAsDto();
    }

    /**
     * @covers ::withAssetsMode
     */
    public function testTheAssetsModeCannotBeChangedAfterTheDtoConversion(): void
    {
        $field = QuillAdminField::new('quill');
        $field->getAsDto();

        $this->expectException(LogicException::class);
        $this->expectExceptionMessage('must be set before the field is converted to a DTO');

        $field->withAssetsMode(QuillAdminField::ASSETS_MODE_NONE);
    }
}
