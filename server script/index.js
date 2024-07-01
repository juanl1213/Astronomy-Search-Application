const PORT = 3000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

//const url = "https://en.wikipedia.org/wiki/Glossary_of_astronomy"

// Set the maximum requests per second
const MAX_REQUESTS_PER_SECOND = 100;

// Initialize variables for rate limiting
let requestCount = 0;
let lastRequestTimestamp = Date.now();

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
//app.METHOD(PATH, HANDLER)

app.get('/results', async (req, res) => {

    const now = Date.now();
    if (requestCount >= MAX_REQUESTS_PER_SECOND && now - lastRequestTimestamp < 1000) {
        // Return a 429 response if the rate limit is exceeded
        res.status(429).send('Too Many Requests');
        return;
    }

    // Increment the request count
    requestCount++;

    // Update the last request timestamp
    lastRequestTimestamp = now;


    const glossaryUrl = 'https://en.wikipedia.org/wiki/Glossary_of_astronomy';

    try {
        // Fetch the glossary terms from Wikipedia
        const glossaryResponse = await axios.get(glossaryUrl);
        const glossaryHtml = glossaryResponse.data;
        const $ = cheerio.load(glossaryHtml);

        const terms = [];

        // Extract terms from the glossary
        $('.glossary dt', glossaryHtml).each(function () {


            // Replace spaces with underscores
            const termWithUnderscores = $(this).text().replace(/ /g, '_');

            const formattedTerm = termWithUnderscores.charAt(0).toUpperCase() + termWithUnderscores.slice(1);

            // URI encode the term
            const encodedTerm = encodeURIComponent(formattedTerm);

            terms.push(encodedTerm);
        });


        // Fetch pageviews data for each term
        const pageviewsData = [];

        for (const term of terms) {
            const project = 'en.wikipedia.org';
            const access = 'all-access';
            const agent = 'all-agents';
            const granularity = 'monthly';
            const start = '20230601';
            const end = '20230701';

            const apiUrl = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${project}/${access}/${agent}/${term}/${granularity}/${start}/${end}`;

            // Make the API call for each term
            try {
                const response = await axios.get(apiUrl);
                const dailyViews = response.data.items[0].views || 0;
                
                // Filter terms with views greater than 30000
                if (dailyViews > 10000) {
                    const data = { term, pageviewsData: response.data };
                    pageviewsData.push(data);

                    // Log the pageviews data for each term to the console
                    console.log(`Pageviews data for ${term}:`, response.data);
                }

            } catch (error) {
                console.error(`Error fetching pageviews for ${term}:`, error.response ? error.response.data : error.message);
            }
        }

        // Send the accumulated pageviews data to the client
        res.json({ pageviewsData, message: 'Pageviews data fetched for all terms.' });

    } catch (error) {
        console.error('Error fetching glossary:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});
