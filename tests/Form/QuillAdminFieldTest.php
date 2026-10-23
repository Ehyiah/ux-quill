<?php

namespace Ehyiah\QuillJsBundle\Tests\Form;

use Ehyiah\QuillJsBundle\Form\QuillAdminField;
use Generator;
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
}
