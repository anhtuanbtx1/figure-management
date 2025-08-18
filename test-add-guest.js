// Test script for adding new wedding guest
const testAddGuest = async () => {
  const testGuest = {
    fullName: "Nguyễn Test User",
    unit: "Bạn bè",
    numberOfPeople: 2,
    contributionAmount: 1000000,
    status: "CONFIRMED",
    relationship: "Bạn thân",
    notes: "Test guest từ API"
  };

  try {
    const response = await fetch('http://localhost:3000/api/wedding-guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testGuest),
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (result.success) {
      console.log('✅ Successfully added guest:', result.data);
    } else {
      console.log('❌ Failed to add guest:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testAddGuest();
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testAddGuest = testAddGuest;
}
