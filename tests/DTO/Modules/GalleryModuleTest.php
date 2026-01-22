<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\GalleryModule;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class GalleryModuleTest extends TestCase
{
    public function testDefaultOptions(): void
    {
        $module = new GalleryModule(options: [
            'listEndpoint' => '/api/images',
        ]);

        $this->assertEquals('mediaGallery', $module->name);
        $this->assertEquals('/api/images', $module->options['listEndpoint']);
        $this->assertEquals('', $module->options['uploadEndpoint']);
        $this->assertEquals('Open the media gallery', $module->options['buttonTitle']);
    }

    public function testMissingListEndpointThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('The option "listEndpoint" is mandatory for module "mediaGallery".');

        new GalleryModule();
    }

    public function testCustomOptions(): void
    {
        $module = new GalleryModule(options: [
            'listEndpoint' => '/api/images',
            'uploadEndpoint' => '/api/upload',
            'buttonTitle' => 'Custom Title',
        ]);

        $this->assertEquals('/api/images', $module->options['listEndpoint']);
        $this->assertEquals('/api/upload', $module->options['uploadEndpoint']);
        $this->assertEquals('Custom Title', $module->options['buttonTitle']);
    }
}
