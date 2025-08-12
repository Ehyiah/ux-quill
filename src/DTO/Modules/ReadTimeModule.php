<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class ReadTimeModule implements ModuleInterface
{
    public const NAME = 'readingTime';

    /** the default value is 200 if no value is provided */
    public const WORDS_PER_MINUTE_OPTION = 'wpm';
    public const LABEL_OPTION = 'label';
    public const SUFFIX_OPTION = 'suffix';
    /** the default value is 2 if no value is provided */
    public const READING_TIME_MINUTES_GREEN_OPTION = 'readTimeOk';
    /** the default value is 5 if no value is provided */
    public const READING_TIME_MINUTES_ORANGE_OPTION = 'readTimeMedium';
    /** use an ID selector to target a specific element in which to display the reading time information (if no provided, the reading time information will be displayed just below the toolbar) */
    public const CONTAINER_TARGET = 'target';

    public function __construct(
        public string $name = self::NAME,
        /**
         * @var array<string, string|string[]>
         */
        public $options = [
            self::WORDS_PER_MINUTE_OPTION => '200',
            self::LABEL_OPTION => 'Reading time: ',
            self::SUFFIX_OPTION => 'min read',
            self::READING_TIME_MINUTES_GREEN_OPTION => '2',
            self::READING_TIME_MINUTES_ORANGE_OPTION => '5',
        ],
    ) {
    }
}
