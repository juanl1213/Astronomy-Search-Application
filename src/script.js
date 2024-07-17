let mediantext = "Median Monthly Pageviews: "
document.addEventListener('DOMContentLoaded', function () {
  const popfilter = document.getElementById('popfilter');
  const glossaryList = document.getElementById('glossary');
  const monthSelect = document.getElementById('month');
  const popularitySelect = document.getElementById('popularity');
  const errorContainer = document.getElementById('error-container');
  const medianPageviewsElement = document.getElementById('average-pageviews');
  const form = document.getElementById('filter-form');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November'
  ];

  let monthlyviewsArray = [];

  // Populate the month dropdown with valid months
  function populateMonthSelect() {
    months.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = index + 1; // Month values are 1-indexed
      option.textContent = month; // Display text in the dropdown
      monthSelect.appendChild(option);
    });
  }

  populateMonthSelect(); // Initialize the month dropdown

  // Function to fetch pageviews data from a text file
  function fetchPageviewsData() {
    return fetch('pageviews_data.txt')
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error fetching pageviews data:', error);
        errorContainer.textContent = 'Error fetching data. Please try again later.';
        return []; // Return an empty array in case of error
      });
  }

  // Function to calculate quartiles for popularity-based filtering
  function calculatePercentiles(sortedData) {
    const n = sortedData.length;
    const index_Q1 = Math.ceil((n + 1) * 0.25);
    const index_Q3 = Math.floor((n + 1) * 0.75);
    const Q1 = sortedData[index_Q1 - 1];
    const Q3 = sortedData[index_Q3 - 1];
    return { Q1, Q3 };
  }

  // Function to filter and populate the glossary list
  function filterAndPopulateGlossary(data) {
    glossaryList.innerHTML = ''; // Clear previous options

    const monthValue = parseInt(monthSelect.value, 10); // Get the selected month
    const popularityValue = popularitySelect.value; // Get the popularity filter

    // Filter data by the selected month
  const filteredByMonth = data.reduce((acc, item) => {
    const term = item.term;
    const pageviewsArray = item.pageviewsData || [];
    const pageviewsForMonth = pageviewsArray[monthValue - 1];

    if (pageviewsForMonth !== undefined) {
      acc.push({ term, pageviews: pageviewsForMonth });
    }

    return acc;
    }, []);


    //console.log("filteredByMonth = ", filteredByMonth);

    const pageviewsForMonth = filteredByMonth.map((item) => item.pageviews);
  const sortedPageviewsForMonth = pageviewsForMonth.sort((a, b) => a - b); // Sort the pageviews array
  const quartiles = calculatePercentiles(sortedPageviewsForMonth);

    let filteredData;

    switch (popularityValue) {
      case 'most-popular':
        filteredData = filteredByMonth.filter((item) => item.pageviews >= quartiles.Q3);
        popfilter.textContent = "Current Filter: Most Popular"
        break;
      case 'least-popular':
        filteredData = filteredByMonth.filter((item) => item.pageviews <= quartiles.Q1);
        popfilter.textContent = "Current Filter: Least Popular"
        break;
      case 'somewhat-popular':
        filteredData = filteredByMonth.filter(
          (item) => item.pageviews < quartiles.Q3 && item.pageviews > quartiles.Q1
        );
        popfilter.textContent = "Current Filter: Somewhat Popular"
        break;
      default: // 'does-not-matter' or invalid option
        filteredData = filteredByMonth;
        popfilter.textContent = "Current Filter: Does Not Matter"
        break;
    }
  
    //console.log("filteredData = ", filteredData);

    if (filteredData.length === 0) {
      errorContainer.textContent = 'No terms match the selected filters.';
      return;
    }

    errorContainer.textContent = ''; // Clear previous errors

    // Populate the glossary list with filtered terms
    filteredData.forEach((item) => {
      const term = item.term.replace(/_/g, ' ');
      //console.log(term); // Replace underscores with spaces
      const option = document.createElement('option');
      option.value = term.toLowerCase(); // Set the option value
      option.textContent = term; // Set the visible text
      glossaryList.appendChild(option);
    });

   // Calculate and display the median pageviews
  const medianIndex = Math.floor(sortedPageviewsForMonth.length / 2);
  const median = (sortedPageviewsForMonth.length % 2 === 0) ?
    (sortedPageviewsForMonth[medianIndex - 1] + sortedPageviewsForMonth[medianIndex]) / 2 :
    sortedPageviewsForMonth[medianIndex];

  medianPageviewsElement.textContent = `${mediantext} ${median}`;
}

  // Fetch the data and set up the form event listener to filter and populate the glossary
  fetchPageviewsData().then((data) => {
    if (data.length === 0) {
      errorContainer.textContent = 'No data available.';
      return;
    }

    console.log(data);

    monthlyviewsArray = data; // Store the fetched data

    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent default form behavior
      filterAndPopulateGlossary(data); // Apply filtering and populate the glossary
    });

    // Initially populate the glossary based on the default filters
    filterAndPopulateGlossary(data);

        // Search form event listener for term-based search
      document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        const availableTerms = Array.from(glossaryList.options).map((option) => 
          option.value.toLowerCase()
        );

        if (!availableTerms.includes(searchTerm)) {
          errorContainer.textContent = 'Please select a valid term from the dropdown list.';
        } else {
          errorContainer.textContent = ''; // Clear error message
          const termObject = data.find(
            (item) => item.term.replace(/_/g, ' ').toLowerCase() === searchTerm
          );

          if (termObject) {
            const encodedTerm = encodeURIComponent(termObject.term);
            const termData = encodeURIComponent(JSON.stringify(termObject));
            window.location.href = `term_template.html?term=${encodedTerm}&term_data=${termData}`;
          } else {
            console.error('Term object not found.');
          }
        }
      });

  });

  // Select the background div
  const backgroundDiv = document.querySelector('.background');

  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  backgroundDiv.appendChild(renderer.domElement);

  // Generate stars
  const starCount = 2000;
  const starGeometry = new THREE.BufferGeometry();
  const starVertices = [];
  const starSizes = [];
  const starOpacity = [];

  for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
      starSizes.push(Math.random() * 2 + 1); // Sizes between 1 and 3
      starOpacity.push(Math.random());
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
  starGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starOpacity, 1));

  const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
          time: { value: 1.0 }
      },
      vertexShader: `
          attribute float size;
          attribute float opacity;
          varying float vOpacity;
          void main() {
              vOpacity = opacity;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size;
              gl_Position = projectionMatrix * mvPosition;
          }
      `,
      fragmentShader: `
          uniform float time;
          varying float vOpacity;
          void main() {
              float twinkle = abs(sin(time + vOpacity * 10.0));
              gl_FragColor = vec4(1.0, 1.0, 1.0, twinkle);
          }
      `,
      transparent: true
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  camera.position.z = 1000;

  // Animation loop
  function animate() {
      requestAnimationFrame(animate);
      starMaterial.uniforms.time.value += 0.01;
      stars.rotation.x += 0.0005;
      stars.rotation.y += 0.0005;
      animateComet();
      renderer.render(scene, camera);
  }


// Create Comet Particles
const cometGeometry = new THREE.BufferGeometry();
const cometVertices = [];

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 2000 - 1000;
  const y = Math.random() * 2000 - 1000;
  const z = Math.random() * 2000 - 1000;
  cometVertices.push(x, y, z);
}

cometGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cometVertices, 3));

const cometMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 2,
  transparent: true,
  opacity: 0.7
});

const comet = new THREE.Points(cometGeometry, cometMaterial);
scene.add(comet);

// Animate comet particles
function animateComet() {
  const positions = comet.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
      positions[i] += 0.5;
      positions[i + 1] += 0.5;
      if (positions[i] > 1000) positions[i] = -1000;
      if (positions[i + 1] > 1000) positions[i + 1] = -1000;
  }
  comet.geometry.attributes.position.needsUpdate = true;
}


animate();
// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;                
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  });

  

/*   // Search form event listener for term-based search
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    const availableTerms = Array.from(glossaryList.options).map((option) => 
      option.value.toLowerCase()
    );

    if (!availableTerms.includes(searchTerm)) {
      errorContainer.textContent = 'Please select a valid term from the dropdown list.';
    } else {
      errorContainer.textContent = ''; // Clear error message
      const termObject = data.find(
        (item) => item.term.replace(/_/g, ' ').toLowerCase() === searchTerm
      );

      if (termObject) {
        const encodedTerm = encodeURIComponent(termObject.term);
        const termData = encodeURIComponent(JSON.stringify(termObject));
        window.location.href = `term_template.html?term=${encodedTerm}&term_data=${termData}`;
      } else {
        console.error('Term object not found.');
      }
    }
  }); */

  // Generate stars dynamically for visual effect
/*   function createStars(numStars) {
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      starsContainer.appendChild(star);
    }
  }

  createStars(100);  /// Generate 100 stars */ 

  
});

// Translation dictionary
const translationDict = {
  en: {
      "Astronomy Resources Repository for Beginners": "Astronomy Resources Repository for Beginners",
      "Welcome! This site provides a collection of astronomy-related terms and their corresponding Wikipedia pageviews data for the year 2023.<br> Use the search bar to explore terms, filter by popularity and month, and learn more about fascinating celestial phenomena.": "Welcome! This site provides a collection of astronomy-related terms and their corresponding Wikipedia pageviews data for the year 2023.<br> Use the search bar to explore terms, filter by popularity and month, and learn more about fascinating celestial phenomena.",
      "Filters for Dropdown List of Terms:": "Filters for Dropdown List of Terms:",
      "Astronomy Picture of the Day": "Astronomy Picture of the Day",
      "Date:": "Date:",
      "Learn More About This Project" : "Learn More About This Project",
      "Filter" : "Filter",
      "Type an astronomy-related term...": "Type an astronomy-related term...",
      "Popularity:": "Popularity:",
      "Most popular only": "Most popular only",
      "Least popular only": "Least popular only",
      "Somewhat popular": "Somewhat popular",
      "Does not matter": "Does not matter",
      "Monthly Views For:": "Monthly Views For:",
      "Median Monthly Pageviews": "Median Monthly Pageviews"
  },
  es: {
      "Astronomy Resources Repository for Beginners": "Repositorio de Recursos de Astronomía para Principiantes",
      "Welcome! This site provides a collection of astronomy-related terms and their corresponding Wikipedia pageviews data for the year 2023.<br> Use the search bar to explore terms, filter by popularity and month, and learn more about fascinating celestial phenomena.": "¡Bienvenido! Este sitio proporciona una colección de términos relacionados con la astronomía y sus correspondientes datos de visualización de páginas de Wikipedia para el año 2023.<br> Use la barra de búsqueda para explorar términos, filtrar por popularidad y mes, y aprender más sobre fenómenos celestiales fascinantes.",
      "Filters for Dropdown List of Terms:": "Filtros para la lista desplegable de términos:",
      "Astronomy Picture of the Day": "Imagen Astronómica del Día",
      "Date:": "Fecha:",
      "Learn More About This Project" : "Aprender mas sobre este proyecto",
      "Filter" : "Filtrar",
      "Popularity:": "Popularidad:",
      "Most popular only": "Solo los más populares",
      "Least popular only": "Solo los menos populares",
      "Monthly Views For:": "Vistas mensuales para:",
      "Somewhat popular": "Algo populares",
      "Does not matter": "No importa",
      "Type an astronomy-related term...": "Escriba un término relacionado con la astronomía...",
      "Median Monthly Pageviews": "Visualizaciones Mensuales Medianas:"
    }
};

let currentLanguage = 'en';
// Function to translate the page
function toggleTranslation() {
  currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
  document.querySelector('.translate-button').textContent = currentLanguage === 'en' ? 'Translate to Spanish' : 'Translate to English';
  document.getElementById('title').textContent = translationDict[currentLanguage]["Astronomy Resources Repository for Beginners"];
  document.getElementById('welcome-message').innerHTML = translationDict[currentLanguage]["Welcome! This site provides a collection of astronomy-related terms and their corresponding Wikipedia pageviews data for the year 2023.<br> Use the search bar to explore terms, filter by popularity and month, and learn more about fascinating celestial phenomena."];
  document.getElementById('filters-title').textContent = translationDict[currentLanguage]["Filters for Dropdown List of Terms:"];
  document.getElementById('apod-title').textContent = translationDict[currentLanguage]["Astronomy Picture of the Day"];
  document.getElementById('moreinfo').textContent = translationDict[currentLanguage]["Learn More About This Project"];
  document.getElementById('filter').textContent = translationDict[currentLanguage]["Filter"];
  document.getElementById('moreinfo').textContent = translationDict[currentLanguage]["Learn More About This Project"];
  document.querySelector('label[for="popularity"]').textContent = translationDict[currentLanguage]["Popularity:"];
  document.getElementById('popularity').options[0].textContent = translationDict[currentLanguage]["Most popular only"];
  document.getElementById('popularity').options[1].textContent = translationDict[currentLanguage]["Least popular only"];
  document.getElementById('popularity').options[2].textContent = translationDict[currentLanguage]["Somewhat popular"];
  document.getElementById('popularity').options[3].textContent = translationDict[currentLanguage]["Does not matter"];
  document.querySelector('label[for="monthly-views"]').textContent = translationDict[currentLanguage]["Monthly Views For:"];
  document.getElementById('search-input').placeholder = translationDict[currentLanguage]["Type an astronomy-related term..."];
  document.getElementById('average-pageviews');
  /* const dateText = document.getElementById('apod-date').textContent;
  if (dateText) {
      document.getElementById('apod-date').textContent = dateText.replace("Date:", translationDict["Date:"]);
  } */
}




