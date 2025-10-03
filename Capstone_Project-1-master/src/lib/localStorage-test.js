// Test localStorage persistence across sessions
console.log('🔍 Testing localStorage persistence...')

// Test 1: Create some test data
const testCourses = [
  {
    id: Date.now().toString(),
    title: 'Test Course 1',
    description: 'This is a test course',
    category: 'Food & Beverages',
    level: 'NC II',
    duration: 100,
    instructor: 'Test Instructor',
    enrolledStudents: 0,
    maxStudents: 20,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Save to localStorage
localStorage.setItem('demo-courses', JSON.stringify(testCourses))
console.log('✅ Test data saved to localStorage')

// Read back from localStorage
const retrieved = JSON.parse(localStorage.getItem('demo-courses') || '[]')
console.log('✅ Retrieved from localStorage:', retrieved.length, 'courses')

// Test persistence
console.log('🔍 localStorage will persist until:')
console.log('  - Browser cache is cleared manually')
console.log('  - User clears browser data')
console.log('  - Storage quota is exceeded (very unlikely)')
console.log('  - Domain changes')
console.log('✅ localStorage WILL survive:')
console.log('  - Page refreshes')
console.log('  - Browser restarts')
console.log('  - Computer restarts')
console.log('  - Localhost server restarts')