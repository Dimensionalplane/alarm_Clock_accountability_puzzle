package main

import (
	"testing"
)

func TestFeedbackStruct(t *testing.T) {
	f := Feedback{
		Message: "Test",
		Rating:  5,
	}
	if f.Message != "Test" {
		t.Errorf("Expected Test, got %s", f.Message)
	}
	if f.Rating != 5 {
		t.Errorf("Expected 5, got %d", f.Rating)
	}
}

func TestSubmoduleStatus(t *testing.T) {
    // Basic type check
    var statuses []SubmoduleStatus
    if len(statuses) != 0 {
        t.Errorf("Expected 0 statuses initially")
    }
}
