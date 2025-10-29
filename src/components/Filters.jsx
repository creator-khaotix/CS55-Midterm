// The filters shown on the game listings page

import Tag from "@/src/components/Tag.jsx";

function FilterSelect({ label, options, value, onChange, name, icon }) {
  return (
    <div>
      <img src={icon} alt={label} />
      <label>
        {label}
        <select value={value} onChange={onChange} name={name}>
          {options.map((option, index) => (
            <option value={option} key={index}>
              {option === "" ? "All" : option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function Filters({ filters, setFilters }) {
  const handleSelectionChange = (event, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: event.target.value,
    }));
  };

  const updateField = (type, value) => {
    setFilters({ ...filters, [type]: value });
  };

  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>Games</p>
            <p>Sorted by {filters.sort || "Rating"}</p>
          </div>
        </summary>

        <form
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            event.target.parentNode.removeAttribute("open");
          }}
        >
          <FilterSelect
            label="Genre"
            options={[
              "",
              "MMORPG",
              "Action-Adventure",
              "RPG",
              "FPS",
              "Puzzle",
              "Platformer",
              "Sandbox",
              "Strategy",
              "Sports",
              "Fighting",
              "Racing",
              "Simulation",
              "Roguelike",
              "Metroidvania",
            ]}
            value={filters.genre}
            onChange={(event) => handleSelectionChange(event, "genre")}
            name="genre"
            icon="/food.svg"
          />

          <FilterSelect
            label="Release Year"
            options={[
              "",
              "1996",
              "1998",
              "2001",
              "2004",
              "2007",
              "2010",
              "2011",
              "2013",
              "2015",
              "2016",
              "2017",
              "2018",
              "2019",
              "2020",
              "2022",
            ]}
            value={filters.releaseYear}
            onChange={(event) => handleSelectionChange(event, "releaseYear")}
            name="releaseYear"
            icon="/location.svg"
          />

          <FilterSelect
            label="Sort"
            options={["Rating", "Review"]}
            value={filters.sort}
            onChange={(event) => handleSelectionChange(event, "sort")}
            name="sort"
            icon="/sortBy.svg"
          />

          <footer>
            <menu>
              <button
                className="button--cancel"
                type="reset"
                onClick={() => {
                  setFilters({
                    releaseYear: "",
                    genre: "",
                    sort: "",
                  });
                }}
              >
                Reset
              </button>
              <button type="submit" className="button--confirm">
                Submit
              </button>
            </menu>
          </footer>
        </form>
      </details>

      <div className="tags">
        {Object.entries(filters).map(([type, value]) => {
          // The main filter bar already specifies what
          // sorting is being used. So skip showing the
          // sorting as a 'tag'
          if (type == "sort" || value == "") {
            return null;
          }
          return (
            <Tag
              key={value}
              type={type}
              value={value}
              updateField={updateField}
            />
          );
        })}
      </div>
    </section>
  );
}
