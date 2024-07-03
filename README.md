# Astronomy-Search-Application

## Description

Astronomy Glossary Search is a website that provides a user-friendly interface to explore the glossary of astronomy terms sourced from Wikipedia. Users can look up astronomy-related terms, such as black hole, gravity, dwarf planet, etc., through a search bar, and the website displays relevant resources (YouTube videos).

## Key Technologies Used

- **HTML, CSS, and JavaScript:** The foundation of the website is built using HTML for structuring content, CSS for styling, and JavaScript for dynamic interactivity.

- **Node.js and Express.js:** The server-side of the application is powered by Node.js, providing a scalable and efficient runtime environment. Express.js is used as a web application framework to handle routing and server-side logic.

- **Axios:** Employed for making HTTP requests, allowing the application to fetch data from external sources, including Wikipedia and MediaWiki.

- **Cheerio:** Used for web scraping, enabling the application to extract relevant information from HTML content, specifically astronomy terms from the Wikipedia glossary of astronomy terms.

## Features

### Search Functionality

Users can search for astronomy-related terms using a search bar. As they type, a dropdown list dynamically suggests relevant terms, providing a user-friendly search experience.

There are two criteria that will be used for filtering the dropdown list of terms:

--Popularity (How many views the term received throughout the selected month compared to the other terms):
    --Most Popular: At least 75th percentile
    --Somewhat Popular: Between 25th and 75th percentile
    --Least Populat: At most 25th percentile
    --Does not matter: All terms are shown

--Month (Calculated results for popularity are based on the views for the selected month)

### Term Details

Clicking on a term in the dropdown list or submitting a search query leads users to a page containing detailed information about the selected astronomy term. This information includes YouTube videos.

### YouTube Integration

The website integrates with the YouTube Data API to fetch educational videos related to astronomy terms. These videos are displayed on the site, offering users additional learning resources.

## How It Works

### Term Data Retrieval

Upon loading, the website fetches a list of astronomy terms from Wikipedia, using web scraping techniques.

### Pageviews Data

Pageviews data for each term are obtained from the Wikimedia REST API, providing insights into the popularity of each term and only showing the most relevant, less obscure terms.

### YouTube Video Recommendations

The website leverages the YouTube Data API to search for educational videos related to astronomy terms, filtering and displaying the top-rated videos.

### Interactive User Interface

The user interface allows for smooth navigation, with real-time term suggestions during searches and dynamic content updates.

## Deployment

The application is deployed to a hosting platform like Render, making it accessible to users worldwide.

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/juanl1213/Astronomy-Videos-Search-Application
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the application:
    ```bash
    npm start
    ```

## Usage

1. Open the web application in your browser.
2. Use the search form to find specific terms in the glossary.
3. Use the filter form to refine results based on popularity.
4. Please note that it may take a few minutes to first fetch results through API requests, which will then be stored in cache memory for subsequent searches. 
5. Explore the dynamic star background for a visually pleasing experience.
6. Visualize the median pageviews for a selected month.

## Contributing

If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and submit a pull request.
4. Follow coding standards and provide detailed information about your changes.
 
