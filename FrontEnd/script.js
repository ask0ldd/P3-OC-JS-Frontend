const api = 'http://localhost:5678/api/'
const galleryContainer = document.querySelector(".gallery")
const filtersContainer = document.querySelector(".filters")
const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")

// delete final upload
const email = "sophie.bluel@test.tld"
const password = "S0phie"
const wrongEmail = "ezaeaz.ezaeza@test.tld"
const wrongPassword = "ezaeza"

/*
<figure>
    <img src="assets/images/abajour-tahina.png" alt="Abajour Tahina">
    <figcaption>Abajour Tahina</figcaption>
</figure>*/

function emptyGallery()
{
    galleryContainer.innerHTML=""
}

function emptyFilters()
{
    filtersContainer.innerHTML=""
}

// !!! deal with errors + add async await
// selectedCategoryId 0 = no filter
async function filterWork(selectedCategoryId){

    await fetch(`${api}works`).then((response)=>{
        //console.log(response.ok)
        return response.json()
    }).then((data) => {

        // check if response 200 or 500 ?
        //console.log(data)
    
        let categories = []
        let pushedIds = []

        emptyGallery()
        emptyFilters()
    
        for(let i=0; i<Object.keys(data).length; i++)
        {
            let work = document.createElement("figure");
            
            // select works where id === selectedCategoryId or all works if selectedCategoryId === 0
            if((data[i].category.id === selectedCategoryId)||(selectedCategoryId === 0)) {
                work.innerHTML = `<img src="${data[i].imageUrl}" alt="${data[i].title}" crossorigin="anonymous"><figcaption>${data[i].title}</figcaption>` // CORS
                galleryContainer.append(work)
            }
    
            //essayer de faire la mm chose avec set
            // push a category {id, name} only if the current id hasn't been pushed yet
            if(pushedIds.includes(data[i].category.id) === false)
            {
                categories.push(data[i].category)
                pushedIds.push(data[i].category.id)
            }
        }
    
        let buttonAll = document.createElement("div")
        buttonAll.textContent = "Tous"
        buttonAll.classList.add("filter")
        selectedCategoryId === 0 ? buttonAll.classList.add("filter--on") : buttonAll.classList.add("filter--off")
        buttonAll.addEventListener("click", () => filterWork(0))
        filtersContainer.append(buttonAll)

        // remplacer div par buttons
        categories.forEach(element => { 
            let button = document.createElement("div")
            button.textContent = element.name
            button.addEventListener("click", () => filterWork(element.id))
            button.classList.add("filter")
            selectedCategoryId === element.id ? button.classList.add("filter--on") : button.classList.add("filter--off")
            filtersContainer.append(button)
        })
    }).catch(error => {
        //element.parentElement.innerHTML = `Error: ${error}`;
        //console.error('There was an error!', error);

        //implement can't load gallery in the gallery div
    })
}

async function log(login, password){

    let logs = {"email": login, "password": password}

    let response = await fetch(`${api}users/login`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(logs)        
    })

    return await response.json()

}

//MAIN

filterWork(0) // 0 = All

let user

loginButton.addEventListener("click", () => log(email, password).then((userDatas) => {user = userDatas}))
contactButton.addEventListener("click", () => {
    if(user === undefined){
        console.log("LOG FIRST")
    }else{
        console.log(user)
    }
})
