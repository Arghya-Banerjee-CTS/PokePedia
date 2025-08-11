export function formatPokemonByNameData(data) {
  return {
    name: data.name,
    id: data.id,
    default_image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
    types: data.types.map((t) => t.type.name),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a) => ({
      name: a.ability.name,
      is_hidden: a.is_hidden,
    })),
    moves: data.moves.map((m) => m.move.name),
    stats: data.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    game_indices: data.game_indices.map((g) => g.version.name),
    forms: data.forms.map((f) => f.name),
  };
}

export function formatAllPokemonData(data) {
  return data.results.map((pokemon) => ({
    name: pokemon.name,
    url: pokemon.url,
  }));
}
