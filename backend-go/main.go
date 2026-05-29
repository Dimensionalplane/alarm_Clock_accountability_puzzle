package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
    "time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type SubmoduleStatus struct {
	Name   string `json:"name"`
	Status string `json:"status"` // "dirty", "uninitialized", "synced"
}

func getSystemStatus(w http.ResponseWriter, r *http.Request) {
	out, err := exec.Command("git", "submodule", "status").Output()
	if err != nil {
		// If no submodules, return empty list
		json.NewEncoder(w).Encode([]SubmoduleStatus{})
		return
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	var statuses []SubmoduleStatus
	for _, line := range lines {
		if line == "" {
			continue
		}
		parts := strings.Fields(line)
		if len(parts) < 2 {
			continue
		}
		status := "synced"
		if strings.HasPrefix(line, "-") {
			status = "uninitialized"
		} else if strings.HasPrefix(line, "+") {
			status = "dirty"
		}
		statuses = append(statuses, SubmoduleStatus{
			Name:   parts[1],
			Status: status,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statuses)
}

func handleReplay(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	defer conn.Close()

	// Mock log streaming for Session Replay
	logs := []string{
		"Session initialized...",
		"Agent Architect: Analyzing requirements...",
		"Agent Engineer: Implementing Wallet Service...",
		"Agent Auditor: Verifying security constraints...",
		"Build successful. Monitoring for anomalies...",
	}

	for _, l := range logs {
		err = conn.WriteMessage(websocket.TextMessage, []byte(l))
		if err != nil {
			log.Println("Write error:", err)
			break
		}
		time.Sleep(1 * time.Second)
	}
}

func main() {
	http.HandleFunc("/api/system/status", getSystemStatus)
	http.HandleFunc("/api/replay", handleReplay)

	fmt.Println("Backend-go starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
