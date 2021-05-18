function submit(){
  
}



function buildURL(spreadsheetId, content) {
  
  let url = `https://docs.google.com/forms/d/e/${spreadsheetId}/viewform?usp=pp_url`

  content.forEach((entry) => {
    url += `&entry.${entry.id}=${entry.value}`
  })

  return url
}