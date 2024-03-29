const API_BASE = "https://openlibrary.org/";
//since we cannot search by year, for start we will just return the first 10 newest js books
const API_NEWEST = "search.json?q=javascript&sort=new&limit=10";
const API_TITLE = "search.json?limit=10&q=";//sort=new

const getAPICall = async (url) => {
    let data = null;
    try {
        const response = await fetch(url);
        data = await response.json();
    } catch {
        console.error('API couldn\'t be reached at this time');
    }

    return data;
}

//used to build the format of the return object, which always has to be the same for each type of api call
const buildReturnObject = (data) => {
    let results = null;

    const books = data.docs;
    if (books.length === 0) return null;
    results = books.map((book) => {
        let bookImgURL;
        if (book.hasOwnProperty("cover_edition_key")) {
            bookImgURL = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`;
        } else {
            bookImgURL = "./assets/images/No_Image_Available.jpg";
        }
        return {
            imgURL: bookImgURL,
            bookTitle: book.title,
            authorName: book.author_name[0],
            yearPublished: book.publish_year[0]
        }
    });

    return results;
};

//gets the first 10 newest book about the javascript, used for the landing page.
const getNewestBooks = async () => {
    const url = `${API_BASE}${API_NEWEST}`;
    const data = await getAPICall(url);
    if (data === null) return null;

    return buildReturnObject(data);
};

//gets the first newest books searched by title. 'titleQuery' param must not be empty, null or undefined when called.
const getResultByTitle = async (titleQuery) => {
    titleQuery = titleQuery ?? '';
    if (titleQuery === '') return null;

    const data = await getAPICall(`${API_BASE}${API_TITLE}${titleQuery}`);
    if (data === null) return null;

    return buildReturnObject(data);
};

//gets search result of books by author
const getResultByAuthor = async (titleQuery) => {
    titleQuery = titleQuery ?? '';
    if (titleQuery === '') return null;

    const dataAuth = await getAPICall(`https://openlibrary.org/search/authors.json?q=${titleQuery}&limit=10`);
    if (dataAuth === null) return null;

    const authKeys = dataAuth.docs.map((author) => {
        return {
            key: author.key,
            name: author.name
        }
    });

    let retObj = [];
    const getAllData = async () => {
        for (let i =0; i < authKeys.length; i++) {
            let data = await fetch(`https://openlibrary.org/authors/${authKeys[i].key}/works.json?limit=10`);
            let jsonData = await data.json();
            const books = jsonData.entries[0];

            let bookImgURL;
            if (books.hasOwnProperty("covers")) {
                bookImgURL = ` https://covers.openlibrary.org/b/id/${books.covers[0]}.jpg`;
            } else {
                bookImgURL = "./assets/images/No_Image_Available.jpg";
            }

            retObj.push({
                imgURL: bookImgURL,
                bookTitle: books.title,
                authorName: authKeys[i].name,
                yearPublished: "N/A"
            });
        }
    };

    await getAllData();

    return retObj;
};

//gets the first 10 books about a topic
const getResultsBySubject = async (titleQuery) => {
    titleQuery = titleQuery ?? '';
    if (titleQuery === '') return null;

    const data = await getAPICall(`https://openlibrary.org/subjects/${titleQuery}.json?limit=10`);
    if (data === null) return null;

    const books = data.works;
    const returnObj = books.map((book) => {
        let bookImgURL;
        if (book.hasOwnProperty("cover_id")) {
            bookImgURL = ` https://covers.openlibrary.org/b/id/${book.cover_id}.jpg`;
        } else {
            bookImgURL = "./assets/images/No_Image_Available.jpg";
        }

        return {
            imgURL: bookImgURL,
            bookTitle: book.title,
            authorName: book.authors[0].name,
            yearPublished: book.first_publish_year
        }
    });

    return returnObj;
}

