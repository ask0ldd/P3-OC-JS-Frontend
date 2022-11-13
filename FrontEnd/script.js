const api = 'http://localhost:5678/api/'
const galleryContainer = document.querySelector(".gallery")
const filtersContainer = document.querySelector(".filters")

/*
<figure>
    <img src="assets/images/abajour-tahina.png" alt="Abajour Tahina">
    <figcaption>Abajour Tahina</figcaption>
</figure>*/

function emptyGallery()
{
    galleryContainer.innerHTML=""
}

//all works
fetch(`${api}works`).then((response)=>{
    const readReponse = response.json()
    return readReponse
}).then((data) => {

    console.log(data)

    let categories = []
    let pushedIds = []

    for(let i=0; i<Object.keys(data).length; i++)
    {
        let work = document.createElement("figure");
        
        // rework avec createelement ?
        work.innerHTML = `<img src="${data[i].imageUrl}" alt="${data[i].title}" crossorigin="anonymous"><figcaption>${data[i].title}</figcaption>`
        galleryContainer.append(work)

        // getfilters

        if(pushedIds.includes(data[i].category.id) === false)
        {
            categories.push(data[i].category)
            pushedIds.push(data[i].category.id)
        }
    }

    categories.forEach(element => { 
        let button = document.createElement("div")
        button.textContent = element.name
        button.addEventListener("click", () => console.log(element.id))
        filtersContainer.append(button)
    })
})


