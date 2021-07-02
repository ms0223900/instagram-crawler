((res) => {
  let handled = [];
  const getPropertyKey = (collection={}, nameOfProperty='') => {
    for(collectionKey in collection) {
        const {
            schema,
        } = collection[collectionKey].value;
        for (const schemaKey in schema) {
            const {
              name,
            } = schema[schemaKey];
            if(name === nameOfProperty) {
                return schemaKey;
            }
        }
    }
  }

  const blocks = res.recordMap.block;
  for(blockId in blocks) {
      const block = blocks[blockId];
      const { properties, parent_table } = block.value;
      let profile = {};
      for(property in properties) {
          const val = properties[property][0][0];
          const pageUrlPropertyKey = getPropertyKey(
            res.recordMap.collection, 'FB網址'
          )
          if(property === pageUrlPropertyKey) {
              profile['pageUrl'] = val;
          }
          if(property === 'title') {
              profile['profileName'] = val;
          }
      }
      if(Object.keys(profile).length > 1 && parent_table === 'collection') {
          handled.push(profile);
      }
  }
  console.log(handled);
})(res)