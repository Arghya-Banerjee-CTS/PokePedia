const apiUrls = {
  getByName: (pokemonName) => {
    return `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
  },

  getAllPokemon: (limit = 100000) => {
    return `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`;
  },
};

export default apiUrls;
