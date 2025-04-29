import { Reporter, TestCase, TestError, TestResult, TestStep } from "@playwright/test/reporter";
const winston = require("winston");

// Configure Winston logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "logs/info.log", level: "info" }),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    ],
});

// Also log to the console for real-time monitoring
logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
}));

/**
 * Custom Playwright Reporter Implementation
 */
export default class CustomReporter implements Reporter {
    /**
     * Called when a test case begins execution
     * @param {TestCase} test - The test case that is starting
     */
    onTestBegin(test: TestCase): void {
        logger.info(`Test Case Started: ${test.title}`);
    }

    /**
     * Called when a test case ends execution
     * @param {TestCase} test - The test case that has completed
     * @param {TestResult} result - The result of the test execution
     */
    onTestEnd(test: TestCase, result: TestResult): void {
        logger.info(`Test Case Completed: ${test.title} | Status: ${result.status}`);
    }

    /**
     * Called when a test step begins execution
     * @param {TestCase} test - The test case containing the step
     * @param {TestResult} result - The result object for the test case
     * @param {TestStep} step - The step that is starting
     */
    onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
        if (step.category === "test.step") {
            logger.info(`Executing Step: ${step.title}`);
        }
    }

    /**
     * Called when an error occurs during test execution
     * @param {TestError} error - The error object containing details
     */
    onError(error: TestError): void {
        logger.error(`Error: ${error.message}`);
    }
}
