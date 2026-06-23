<?php

namespace Ehyiah\QuillJsBundle\Tests\DTO\Fields\Inline;

use Ehyiah\QuillJsBundle\DTO\Fields\InlineField\ImageGalleryField;
use Ehyiah\QuillJsBundle\DTO\Modules\ImageGalleryModule;
use PHPUnit\Framework\TestCase;

/**
 * @coversNothing
 */
class ImageGalleryFieldTest extends TestCase
{
    public function testField(): void
    {
        $field = new ImageGalleryField();

        $this->assertEquals('imageGallery', $field->getOption());
        $this->assertContains(ImageGalleryModule::class, ImageGalleryField::importModules());
    }
}
