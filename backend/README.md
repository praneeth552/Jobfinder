# Subscription Management

This directory contains the logic for managing user subscriptions.

## Daily Subscription Check

The `subscription_manager.py` script is designed to be run daily to handle expired subscriptions. It downgrades users to the "free" plan if their subscription has expired.

### Cron Job Setup

To automate this script, you can set up a cron job on your server.

1.  Open your crontab file for editing:
    ```bash
    crontab -e
    ```

2.  Add the following line to run the script every day at midnight:
    ```bash
    0 0 * * * /path/to/your/venv/bin/python /path/to/your/project/backend/subscription_manager.py
    ```
    *   **Important:** Replace `/path/to/your/venv/bin/python` with the absolute path to the Python interpreter inside your virtual environment.
    *   **Important:** Replace `/path/to/your/project/backend/subscription_manager.py` with the absolute path to the `subscription_manager.py` script.

    For example:
    ```bash
    0 0 * * * /Users/saipraneethkotyada/Desktop/Tackleit/backend/venv/bin/python /Users/saipraneethkotyada/Desktop/Tackleit/backend/subscription_manager.py
    ```

3.  Save and close the file.

This will ensure that the subscription status of all users is checked and updated daily, providing a fallback for any missed webhook events. It will also send renewal reminders to users whose subscriptions are about to expire.
