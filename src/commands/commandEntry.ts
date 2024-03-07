/**
 * @type {Object} Command // Command to register with the VS Code Extension API
 * @prop {string} command // Name of the command; e.g., 'mind-reader.selectTheme'
 * @prop {callback} callback // Callback to register when `command` is invoked
 */
export type CommandEntry = {
	name: string;
	execute: () => void;
	undo: ((context: CommandEntry) => void) | (() => void);
	data?: Record<string, any>;
};
