document.addEventListener('DOMContentLoaded', function () {
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
        break;
      case 'least-popular':
        filteredData = filteredByMonth.filter((item) => item.pageviews <= quartiles.Q1);
        break;
      case 'somewhat-popular':
        filteredData = filteredByMonth.filter(
          (item) => item.pageviews < quartiles.Q3 && item.pageviews > quartiles.Q1
        );
        break;
      default: // 'does-not-matter' or invalid option
        filteredData = filteredByMonth;
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

  medianPageviewsElement.textContent = `Median Monthly Pageviews: ${median}`;
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
});



