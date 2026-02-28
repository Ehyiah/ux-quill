<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Modules;

use Ehyiah\QuillJsBundle\DTO\Modules\ImageGalleryModule;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class ImageGalleryModuleTest extends TestCase
{
    public function testDefaultOptions(): void
    {
        $module = new ImageGalleryModule(options: [
            'listEndpoint' => '/api/images',
        ]);

        $this->assertEquals('imageGallery', $module->name);
        $this->assertEquals('/api/images', $module->options['listEndpoint']);
        $this->assertArrayNotHasKey('uploadEndpoint', $module->options);
        $this->assertEquals('Open the media gallery', $module->options['buttonTitle']);
        $this->assertEquals('Media gallery', $module->options['messageTitleOption']);
        $this->assertEquals('Close', $module->options['messageCloseOption']);
    }

    public function testMissingListEndpointThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('The option "listEndpoint" is mandatory for module "imageGallery".');

        new ImageGalleryModule();
    }

    public function testCustomOptions(): void
    {
        $module = new ImageGalleryModule(options: [
            'listEndpoint' => '/api/images',
            'uploadEndpoint' => '/api/upload',
            'buttonTitle' => 'Custom Title',
            'uploadStrategy' => 'json',
            'jsonResponseFilePath' => 'data.link',
        ]);

        $this->assertEquals('/api/images', $module->options['listEndpoint']);
        $this->assertEquals('/api/upload', $module->options['uploadEndpoint']);
        $this->assertEquals('Custom Title', $module->options['buttonTitle']);
        $this->assertEquals('json', $module->options['uploadStrategy']);
        $this->assertEquals('data.link', $module->options['jsonResponseFilePath']);
    }

    public function testNullUploadEndpoint(): void
    {
        $module = new ImageGalleryModule(options: [
            'listEndpoint' => '/api/images',
            'uploadEndpoint' => null,
        ]);

        $this->assertNull($module->options['uploadEndpoint']);
    }
}
