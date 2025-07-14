const booksData = [
    { animal: "cat", Language: "English", title: "The Cat in the Hat" },
    { animal: "dog", Language: "French", title: "Bonjour Dog" },
    { animal: "bear", Language: "German", title: "Bär im Wald" }
  ];
  
  const hoveredId = "dog-French";
  const [animal, lang] = hoveredId.split("-");
  
  const hoveredData = booksData.find(
    (d) => d.animal === animal && d.Language === lang
  );
  
  console.log("hoveredData:", hoveredData);
  