<?php

namespace Ehyiah\QuillJsBundle\DTO\Modules;

final class ReadTimeModule implements ModuleInterface
{
    public const NAME = 'readingTime';

    public const LABEL_OPTION = 'label';
    public const SUFFIX_OPTION = 'suffix';

    /**
     * the default value is 200 if no value is provided
     */
    public const WORDS_PER_MINUTE_OPTION = 'wpm';

    /**
     * The default value is 2 if no value is provided.
     * The indicator will be green if the reading module is below this value
     */
    public const READING_TIME_MINUTES_GREEN_OPTION = 'readTimeOk';

    /**
     * The default value is 5 if no value is provided.
     * The indicator will be orange if the reading module is below this value
     * The indicator will be red if the reading time is above this value
     */
    public const READING_TIME_MINUTES_ORANGE_OPTION = 'readTimeMedium';

    /**
     * use an ID selector to target a specific element in which to display the reading time information.
     * (if no value is provided, the reading time information will be displayed in the toolbar)
     */
    public const CONTAINER_TARGET = 'target';

    public function __construct(
        /**
         * @var array<string, string|string[]>
         */
        public $options = [
            self::WORDS_PER_MINUTE_OPTION => '200',
            self::LABEL_OPTION => '⏱ Reading time: ~ ',
            self::SUFFIX_OPTION => ' minute(s)',
            self::READING_TIME_MINUTES_GREEN_OPTION => '5',
            self::READING_TIME_MINUTES_ORANGE_OPTION => '8',
        ],
        public string $name = self::NAME,
    ) {
    }
}
