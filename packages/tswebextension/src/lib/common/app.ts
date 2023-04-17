import { FilteringLogEvent } from './filtering-log';
import { EventChannelInterface } from './utils';

export interface AppInterface<TConfiguration, TConfigurationContext, TConfigurationResult> {
    /**
     * Configuration context.
     */
    configuration?: TConfigurationContext;

    /**
     * Is app started.
     */
    isStarted: boolean;

    /**
     * Fires on filtering log event.
     */
    onFilteringLogEvent: EventChannelInterface<FilteringLogEvent>,

    /**
     * Fires when a rule has been created from the helper.
     */
    onAssistantCreateRule: EventChannelInterface<string>;

    /**
     * Starts api.
     *
     * @param configuration App configuration.
     */
    start: (configuration: TConfiguration) => Promise<TConfigurationResult>;

    /**
     * Updates configuration.
     *
     * @param configuration App configuration.
     */
    configure: (configuration: TConfiguration) => Promise<TConfigurationResult>;

    /**
     * Stops api.
     */
    stop: () => Promise<void>;

    /**
     * Launches assistant in the current tab.
     */
    openAssistant: (tabId: number) => void;

    /**
     * Closes assistant.
     */
    closeAssistant: (tabId: number) => void;

    /**
     * Returns number of active rules.
     */
    getRulesCount(): number,
}