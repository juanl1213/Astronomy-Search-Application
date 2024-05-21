const urlParams = new URLSearchParams(window.location.search);
const term = urlParams.get('term').replace(/_/g, ' ');
const termDataParam = urlParams.get('term_data');


const termData = termDataParam ? JSON.parse(decodeURIComponent(termDataParam)) : null;

console.log("termData = ", termData);

if (term) {
    // Get all elements with the class "term-title"
    const elements = document.getElementsByClassName('term-title');
            
    // Iterate through the elements and update their text content
    for (const element of elements) {
        element.textContent = term;
    }


}
// Function to fetch and filter YouTube videos based on the search term and description
function fetchAndFilterEducationalYouTubeVideos(searchTerm) {
    // Replace 'YOUR_API_KEY' with your actual YouTube Data API key
    const apiKey = 'AIzaSyCtZK0Ef1ugicZnM18t6lw6Ng1qv1PS2WE';
    const maxResults = 3; // Number of videos to display

    const searchQuery = `${searchTerm} astronomy`;

    // Make a GET request to the YouTube Data API with the description filter
    fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${searchQuery} educational&maxResults=${maxResults}&part=snippet&type=video&videoEmbeddable=true`)
        .then(response => response.json())
        .then(data => {
            const videosContainer = document.getElementById('youtube-videos');

            const filteredVideos = data.items
                .filter(video => !containsKidsOrChildren(video.snippet.title) && !containsKidsOrChildren(video.snippet.description));

            const sortedVideos = filteredVideos.sort((a, b) => b.relevance - a.relevance);

            // Select the top three videos
            const topThreeVideos = sortedVideos.slice(0, 3);

            // Iterate through the top three videos and filter out "Video unavailable" videos
            topThreeVideos.forEach(video => {
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${video.id.videoId}`;
                iframe.width = '560'; // Set the desired width
                iframe.height = '315'; // Set the desired height
                videosContainer.appendChild(iframe);
                            
                });
            })
            .catch(error => console.error('YouTube API error:', error));
        }
            
// Function to check if a string contains "kids" or "children"
function containsKidsOrChildren(str) {
    const lowercasedStr = str.toLowerCase();
    return lowercasedStr.includes('kids') || lowercasedStr.includes('children');
}

// Call the function to fetch and display filtered educational YouTube videos
fetchAndFilterEducationalYouTubeVideos(term);

function createStars(numStars) {
    const starsContainer = document.querySelector('.stars');

    // Create stars with random positions
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + 'vw';  //Random horizontal position 
        star.style.top = Math.random() * 100 + 'vh';  //Random vertical position 
        starsContainer.appendChild(star);
    }
}         
// Generate 100 stars
createStars(100);


document.addEventListener('DOMContentLoaded', function() {
    const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November'
      ];
    

    if (termData) {
      // Generate chart data for all months
      const chartData = {
        labels: months.slice(0, 11), // Assuming months are 1-indexed
        datasets: [
          {
            label: term,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            data: termData.pageviewsData,
          },
        ],
      };
  
      // Get the chart container
      const chartContainer = document.getElementById('chart');
  
      if (!chartContainer) {
        console.error('Chart container not found.');
        return;
      }
  
      // Create a bar chart
      const ctx = chartContainer.getContext('2d');
      if (!ctx) {
        console.error('Failed to get chart context.');
        return;
      }
  
      const pageviewsChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            x: {
              ticks: {
                color: 'white',
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: 'white',
              },
              title: {
                display: true,
                text: 'Pageviews',
                color: 'white',
              },
            },
          },
        },
      });
    } else {
      console.error('Invalid or missing termData.');
    }
  });
  
  