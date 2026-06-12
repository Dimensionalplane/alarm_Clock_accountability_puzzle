package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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

type Feedback struct {
	Message   string    `json:"message"`
	Rating    int       `json:"rating"`
	Timestamp time.Time `json:"timestamp"`
}

func getSystemStatus(w http.ResponseWriter, r *http.Request) {
	out, err := exec.Command("git", "submodule", "status").Output()
	if err != nil {
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

	logs := []string{
		"Session initialized...",
		"Monitoring user interactions...",
		"Feedback collection active.",
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

func handleFeedback(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var f Feedback
	err := json.NewDecoder(r.Body).Decode(&f)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	f.Timestamp = time.Now()

	// Log feedback to file
	file, err := os.OpenFile("feedback.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err == nil {
		defer file.Close()
		logEntry := fmt.Sprintf("[%s] Rating: %d | Message: %s\n", f.Timestamp.Format(time.RFC3339), f.Rating, f.Message)
		file.WriteString(logEntry)
	}

	fmt.Printf("Received Feedback: %+v\n", f)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func main() {
	http.HandleFunc("/api/system/status", getSystemStatus)
	http.HandleFunc("/api/replay", handleReplay)
	http.HandleFunc("/api/feedback", handleFeedback)

	fmt.Println("Backend-go starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
