const apiUrls = {
  getByName: (pokemonName) => {
    return `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
  },
};

export default apiUrls;
