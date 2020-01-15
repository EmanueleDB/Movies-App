import React, { Component } from "react";
import { Link } from "react-router-dom";
import { getMovies } from "../services/fakeMovieService";
import Pagination from "./common/Pagination";
import { Paginate } from "../utils/Paginate";
import ListGroup from "./common/ListGroup";
import { getGenres } from "../services/fakeGenreService";
import MoviesTable from "./MoviesTable";
import SearchBox from "./SearchBox";
import _ from "lodash";

class Movies extends Component {
  state = {
    movies: [],
    genres: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    selectedGenre: null,
    sortColumn: { path: "title", order: "asc" }
  };

  componentDidMount() {
    const genres = [{ _id: "", name: "All Genres" }, ...getGenres()];
    this.setState({ movies: getMovies(), genres });
  }

  handleDelete = movie => {
    const movies = this.state.movies.filter(m => m._id !== movie._id);
    const { currentPage, pageSize } = this.state;
    this.setState({ movies: movies });
    if (
      currentPage > 1 &&
      movies.length % pageSize === 0 &&
      currentPage * pageSize > movies.length
    )
      this.handlePageChange(currentPage - 1);
  };

  handleLike = movie => {
    const movies = [...this.state.movies]; // cloning the state
    const index = movies.indexOf(movie); // assigning to the const index the index of a movie
    movies[index] = { ...movies[index] }; // cloning the index of the movies in a new object
    movies[index].liked = !movies[index].liked; // we toggle it (if it's true it becomes false and opposite)
    this.setState({ movies }); //returning the new state
  };

  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  handleGenreSelect = genre => {
    this.setState({ selectedGenre: genre, searchQuery: "", currentPage: 1 });
  };

  handleSearch = query => {
    this.setState({ searchQuery: query, selectedGenre: null, currentPage: 1 });
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      selectedGenre,
      searchQuery,
      movies: allMovies
    } = this.state;
    let filtered = allMovies;
    if (searchQuery)
      filtered = allMovies.filter(m =>
        m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedGenre && selectedGenre._id)
      filtered = allMovies.filter(m => m.genre._id === selectedGenre._id);
    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);
    const movies = Paginate(sorted, currentPage, pageSize);
    return { totalCount: filtered.length, data: movies };
  };

  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  render() {
    const { length: count } = this.state.movies;
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    if (count === 0) return <p>There are no Movies!</p>;
    const { totalCount, data: movies } = this.getPagedData();
    return (
      <div className="row">
        <div className="col-2">
          <ListGroup
            items={this.state.genres}
            selectedItem={this.state.selectedGenre}
            onItemSelect={this.handleGenreSelect}
          />
        </div>
        <div className="col">
          <Link
            to="/movies/new"
            className="btn btn-primary"
            style={{ marginBottom: 20 }}
          >
            New Movie
          </Link>
          <SearchBox value={searchQuery} onChange={this.handleSearch} />
          <p>Showing {totalCount} movies in the database</p>
          <MoviesTable
            movies={movies}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
            sortColumn={sortColumn}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChanged={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Movies;