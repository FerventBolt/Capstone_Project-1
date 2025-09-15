// Initialize sample course content for default courses
export function initializeCourseContent() {
  const courseContents = {
    '1': { // Restaurant Service Operations NC II
      lessons: [
        {
          id: '1-lesson-1',
          title: 'Introduction to Restaurant Service',
          description: 'Learn the fundamentals of professional restaurant service operations.',
          content: 'This lesson covers the basic principles of restaurant service, including understanding the service cycle, types of service styles, and the importance of customer satisfaction in the hospitality industry.',
          duration: 45,
          materials: [
            {
              id: 'mat-1-1',
              name: 'Restaurant Service Guide.pdf',
              type: 'pdf',
              url: '/materials/restaurant-service-guide.pdf',
              size: '2.5 MB'
            },
            {
              id: 'mat-1-2',
              name: 'Service Standards Video',
              type: 'video',
              url: '/materials/service-standards.mp4',
              size: '150 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-1-1',
              title: 'Service Standards Assessment',
              description: 'Complete a written assessment on restaurant service standards and customer service principles.',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Answer all questions based on the lesson materials. Provide detailed explanations for scenario-based questions.'
            }
          ],
          order: 1,
          isPublished: true
        },
        {
          id: '1-lesson-2',
          title: 'Table Setting and Preparation',
          description: 'Master the art of proper table setting and dining room preparation.',
          content: 'Learn the correct placement of tableware, glassware, and linens. Understand different table setting styles for various dining occasions and how to prepare the dining area for service.',
          duration: 60,
          materials: [
            {
              id: 'mat-1-3',
              name: 'Table Setting Guide.pdf',
              type: 'pdf',
              url: '/materials/table-setting-guide.pdf',
              size: '1.8 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-1-2',
              title: 'Table Setting Practical',
              description: 'Demonstrate proper table setting techniques for formal and casual dining.',
              dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Submit photos of your table settings with explanations of each element placement.'
            }
          ],
          order: 2,
          isPublished: true
        },
        {
          id: '1-lesson-3',
          title: 'Order Taking and Menu Knowledge',
          description: 'Develop skills in taking orders and comprehensive menu knowledge.',
          content: 'Learn effective order-taking techniques, menu presentation skills, and how to handle special dietary requirements and customer preferences.',
          duration: 50,
          materials: [
            {
              id: 'mat-1-4',
              name: 'Menu Knowledge Handbook.pdf',
              type: 'pdf',
              url: '/materials/menu-knowledge.pdf',
              size: '3.2 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-1-3',
              title: 'Menu Knowledge Test',
              description: 'Complete a comprehensive test on menu items, ingredients, and preparation methods.',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Study the menu handbook and answer questions about ingredients, allergens, and preparation methods.'
            }
          ],
          order: 3,
          isPublished: true
        }
      ]
    },
    '2': { // Front Desk Operations NC II
      lessons: [
        {
          id: '2-lesson-1',
          title: 'Hotel Front Desk Overview',
          description: 'Introduction to front desk operations and responsibilities.',
          content: 'Understand the role of the front desk in hotel operations, key responsibilities, and the importance of first impressions in guest service.',
          duration: 40,
          materials: [
            {
              id: 'mat-2-1',
              name: 'Front Desk Operations Manual.pdf',
              type: 'pdf',
              url: '/materials/front-desk-manual.pdf',
              size: '4.1 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-2-1',
              title: 'Front Desk Role Analysis',
              description: 'Write a detailed analysis of front desk responsibilities and their impact on guest experience.',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Provide a 500-word analysis covering key responsibilities, challenges, and best practices.'
            }
          ],
          order: 1,
          isPublished: true
        },
        {
          id: '2-lesson-2',
          title: 'Reservation Systems and Management',
          description: 'Learn to manage hotel reservations effectively.',
          content: 'Master reservation software, booking procedures, room allocation, and handling reservation modifications and cancellations.',
          duration: 55,
          materials: [
            {
              id: 'mat-2-2',
              name: 'Reservation System Guide.pdf',
              type: 'pdf',
              url: '/materials/reservation-guide.pdf',
              size: '2.7 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-2-2',
              title: 'Reservation Scenarios',
              description: 'Complete practical exercises handling various reservation scenarios.',
              dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Work through the provided scenarios and document your responses and reasoning.'
            }
          ],
          order: 2,
          isPublished: true
        }
      ]
    },
    '3': { // Housekeeping Operations NC II
      lessons: [
        {
          id: '3-lesson-1',
          title: 'Housekeeping Fundamentals',
          description: 'Basic principles of professional housekeeping operations.',
          content: 'Learn the fundamentals of housekeeping including safety procedures, cleaning standards, and quality control measures.',
          duration: 45,
          materials: [
            {
              id: 'mat-3-1',
              name: 'Housekeeping Standards Manual.pdf',
              type: 'pdf',
              url: '/materials/housekeeping-manual.pdf',
              size: '3.5 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-3-1',
              title: 'Cleaning Standards Checklist',
              description: 'Create a comprehensive cleaning checklist for guest rooms.',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Develop a detailed checklist covering all areas of a guest room with quality standards.'
            }
          ],
          order: 1,
          isPublished: true
        }
      ]
    },
    '4': { // Tourism Services NC II
      lessons: [
        {
          id: '4-lesson-1',
          title: 'Tourism Industry Overview',
          description: 'Introduction to the tourism industry and its components.',
          content: 'Understand the tourism industry structure, key stakeholders, and the role of tourism services in economic development.',
          duration: 50,
          materials: [
            {
              id: 'mat-4-1',
              name: 'Tourism Industry Guide.pdf',
              type: 'pdf',
              url: '/materials/tourism-guide.pdf',
              size: '2.9 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-4-1',
              title: 'Tourism Impact Analysis',
              description: 'Analyze the economic and social impact of tourism in your local area.',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Research and write a 750-word analysis of tourism impacts in your region.'
            }
          ],
          order: 1,
          isPublished: true
        }
      ]
    },
    '5': { // Commercial Cooking NC II
      lessons: [
        {
          id: '5-lesson-1',
          title: 'Kitchen Safety and Sanitation',
          description: 'Essential safety and sanitation practices in commercial kitchens.',
          content: 'Learn critical food safety principles, HACCP guidelines, personal hygiene standards, and kitchen safety procedures.',
          duration: 60,
          materials: [
            {
              id: 'mat-5-1',
              name: 'Food Safety Manual.pdf',
              type: 'pdf',
              url: '/materials/food-safety-manual.pdf',
              size: '4.2 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-5-1',
              title: 'HACCP Plan Development',
              description: 'Develop a HACCP plan for a specific food preparation process.',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Choose a food item and create a complete HACCP plan with critical control points.'
            }
          ],
          order: 1,
          isPublished: true
        },
        {
          id: '5-lesson-2',
          title: 'Basic Cooking Techniques',
          description: 'Fundamental cooking methods and techniques.',
          content: 'Master basic cooking techniques including sautéing, braising, grilling, roasting, and steaming. Understand heat transfer and cooking principles.',
          duration: 75,
          materials: [
            {
              id: 'mat-5-2',
              name: 'Cooking Techniques Guide.pdf',
              type: 'pdf',
              url: '/materials/cooking-techniques.pdf',
              size: '5.1 MB'
            },
            {
              id: 'mat-5-3',
              name: 'Cooking Demonstration Videos',
              type: 'video',
              url: '/materials/cooking-demos.mp4',
              size: '250 MB'
            }
          ],
          assignments: [
            {
              id: 'assign-5-2',
              title: 'Cooking Technique Demonstration',
              description: 'Demonstrate three different cooking techniques with photo documentation.',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'published',
              maxPoints: 100,
              instructions: 'Prepare dishes using three different techniques and document the process with photos and explanations.'
            }
          ],
          order: 2,
          isPublished: true
        }
      ]
    }
  }

  // Store course content in localStorage
  Object.entries(courseContents).forEach(([courseId, content]) => {
    localStorage.setItem(`course-${courseId}-lessons`, JSON.stringify(content.lessons))
  })

  console.log('Course content initialized for all default courses')
}

// Function to check if content is already initialized
export function isCourseContentInitialized(): boolean {
  return localStorage.getItem('course-content-initialized') === 'true'
}

// Function to mark content as initialized
export function markCourseContentInitialized(): void {
  localStorage.setItem('course-content-initialized', 'true')
}