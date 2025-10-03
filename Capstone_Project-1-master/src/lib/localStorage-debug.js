// Debug localStorage behavior
console.log('=== localStorage Debug Test ===');

// Test 1: Basic localStorage functionality
try {
  localStorage.setItem('test-key', 'test-value');
  const retrieved = localStorage.getItem('test-key');
  console.log('✅ Basic localStorage works:', retrieved === 'test-value');
  localStorage.removeItem('test-key');
} catch (error) {
  console.error('❌ Basic localStorage failed:', error);
}

// Test 2: Check current demo-courses data
try {
  const currentCourses = localStorage.getItem('demo-courses');
  console.log('📚 Current demo-courses in localStorage:', currentCourses);
  if (currentCourses) {
    const parsed = JSON.parse(currentCourses);
    console.log('📚 Parsed courses count:', parsed.length);
    console.log('📚 Courses:', parsed);
  } else {
    console.log('📚 No demo-courses found in localStorage');
  }
} catch (error) {
  console.error('❌ Error reading demo-courses:', error);
}

// Test 3: Simulate course creation
try {
  const testCourse = {
    id: 'test-' + Date.now(),
    title: 'Test Course',
    description: 'Test Description',
    category: 'Food & Beverages',
    level: 'NC II',
    duration: 100,
    instructor: 'Test Instructor',
    enrolledStudents: 0,
    maxStudents: 20,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const existingCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
  const updatedCourses = [...existingCourses, testCourse];
  localStorage.setItem('demo-courses', JSON.stringify(updatedCourses));
  
  console.log('✅ Test course added successfully');
  console.log('📚 Total courses after test:', updatedCourses.length);
  
  // Verify it was saved
  const verifyRead = JSON.parse(localStorage.getItem('demo-courses') || '[]');
  console.log('✅ Verification read successful, count:', verifyRead.length);
  
} catch (error) {
  console.error('❌ Error in course creation test:', error);
}

console.log('=== End localStorage Debug Test ===');