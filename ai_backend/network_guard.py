import time
import psutil
import threading
import logging
from typing import Dict, Any

logger = logging.getLogger("sovereign_workbench.network_guard")

class NetworkSovereigntyGuard:
    """
    Air-Gap Network Monitor.
    Tracks network interface I/O counters continuously via psutil.
    Ignores local loopback adapters to calculate true WAN Egress leakage (KB/s).
    """

    LOOPBACK_NAMES = ["lo", "loopback", "127.0.0.1", "localhost", "loopback pseudo-interface 1"]

    def __init__(self, sample_interval_sec: float = 1.0):
        self.sample_interval = sample_interval_sec
        self._running = False
        self._thread = None
        self.wan_egress_kbps = 0.0
        self.wan_ingress_kbps = 0.0
        self.airgap_active = True
        self.last_check_timestamp = time.time()
        self._prev_bytes_sent = 0
        self._prev_bytes_recv = 0

    def start(self):
        """Starts background daemon network monitoring thread."""
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()
        logger.info("Air-Gap Sovereignty Network Guard started.")

    def stop(self):
        self._running = False

    def _is_loopback(self, nic_name: str) -> bool:
        nic_lower = nic_name.lower()
        return any(lb in nic_lower for lb in self.LOOPBACK_NAMES)

    def _get_external_io(self) -> tuple[int, int]:
        """Sums bytes_sent and bytes_recv across non-loopback network interfaces."""
        total_sent = 0
        total_recv = 0
        try:
            counters = psutil.net_io_counters(pernic=True)
            for nic, stat in counters.items():
                if not self._is_loopback(nic):
                    total_sent += stat.bytes_sent
                    total_recv += stat.bytes_recv
        except Exception as e:
            logger.warning(f"psutil network check warning: {e}")
        return total_sent, total_recv

    def _monitor_loop(self):
        self._prev_bytes_sent, self._prev_bytes_recv = self._get_external_io()
        
        while self._running:
            time.sleep(self.sample_interval)
            now = time.time()
            dt = max(0.1, now - self.last_check_timestamp)
            
            curr_sent, curr_recv = self._get_external_io()
            
            bytes_sent_diff = max(0, curr_sent - self._prev_bytes_sent)
            bytes_recv_diff = max(0, curr_recv - self._prev_bytes_recv)
            
            # Convert to KB/s
            self.wan_egress_kbps = round((bytes_sent_diff / 1024.0) / dt, 2)
            self.wan_ingress_kbps = round((bytes_recv_diff / 1024.0) / dt, 2)
            
            # Air-gap is active if external WAN egress rate is below threshold (e.g. < 5.0 KB/s background noise)
            self.airgap_active = (self.wan_egress_kbps < 5.0)
            
            self._prev_bytes_sent = curr_sent
            self._prev_bytes_recv = curr_recv
            self.last_check_timestamp = now

    def get_telemetry_status(self) -> Dict[str, Any]:
        """Returns current air-gap sovereignty telemetry status payload."""
        return {
            "airgap_status": "ACTIVE" if self.airgap_active else "WAN_ACTIVITY_DETECTED",
            "wan_egress_kbps": self.wan_egress_kbps,
            "wan_ingress_kbps": self.wan_ingress_kbps,
            "external_leakage_text": f"{self.wan_egress_kbps:.2f} KB/s External Leakage",
            "is_secure": self.airgap_active,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

# Global singleton instance
guard_instance = NetworkSovereigntyGuard()
