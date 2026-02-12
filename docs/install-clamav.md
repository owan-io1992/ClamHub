# Installing and Configuring ClamAV

ClamHub relies on a local ClamAV Daemon (`clamd`) instance to perform scanning operations. This guide covers the installation and basic configuration of ClamAV on common Linux distributions.

## Prerequisites

-   A Linux server (Debian/Ubuntu or RHEL/CentOS based).
-   Root or sudo access.

## 1. Installation

### Debian, Ubuntu, and derivatives

```bash
sudo apt-get update
sudo apt-get install clamav clamav-daemon
```

### RHEL, CentOS, Fedora, and Rocky Linux

You may need to enable the EPEL repository first for RHEL/CentOS systems.

```bash
sudo dnf install epel-release
sudo dnf install clamav clamd clamav-update
```

### Arch Linux

```bash
sudo pacman -S clamav
```

## 2. Updating Virus Definitions

Before starting the service, you must update the virus signature database.

1.  Stop the `freshclam` service if it's running (to avoid lock errors):
    ```bash
    sudo systemctl stop clamav-freshclam
    ```

2.  Run the update manually:
    ```bash
    sudo freshclam
    ```

3.  Restart the `freshclam` daemon service to keep definitions up to date automatically:
    ```bash
    sudo systemctl start clamav-freshclam
    sudo systemctl enable clamav-freshclam
    ```

## 3. Configuring `clamd`

The ClamAV Daemon configuration file is typically located at:
-   **Debian/Ubuntu**: `/etc/clamav/clamd.conf`
-   **RHEL/CentOS**: `/etc/clamd.d/scan.conf` (or similar)

### Important Settings for ClamHub

ClamHub's Agent connects to ClamAV via a **Unix Socket**. Ensure the following settings are configured:

1.  **LocalSocket**: This must be uncommented and point to a valid path.
    -   Example: `LocalSocket /var/run/clamav/clamd.ctl`
2.  **LocalSocketGroup**: Ensure the socket group is accessible (often `clamav`).
3.  **LocalSocketMode**: Should be `660` or similar to allow group access.
4.  **User**: The user the daemon runs as (usually `clamav`).

**Note**: If you want the ClamHub Agent (running as your user) to talk to ClamAV, you may need to add your user to the `clamav` group:

```bash
sudo usermod -aG clamav $USER
```
*(You will need to log out and back in for this to take effect)*

## 4. Starting the Service

Enable and start the ClamAV Daemon service.

### Debian/Ubuntu

```bash
sudo systemctl enable clamav-daemon
sudo systemctl start clamav-daemon
```

### RHEL/CentOS

The service name might be `clamd@scan` service.

```bash
sudo systemctl enable clamd@scan
sudo systemctl start clamd@scan
```

## 5. Verification

Check if the status is active and running:

```bash
sudo systemctl status clamav-daemon
# OR
sudo systemctl status clamd@scan
```

You can also test the connection using `clamdscan`:

```bash
clamdscan --version
```
If this command returns the ClamAV version, the daemon is reachable and working correctly.
