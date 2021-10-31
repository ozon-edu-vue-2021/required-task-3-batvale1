import Vue from "vue";

class LoaderService {
  data = Vue.observable({
    isLoading: false,
    isLoadingError: false,
  });

  get loaderState() {
    return {
      isLoadingState: this.isLoadingState,
      isLoadingErrorState: this.isLoadingErrorState,
      isLoadingOrErrorState: this.isLoadingOrErrorState,
    };
  }

  get isLoadingState() {
    return this.data.isLoading;
  }

  get isLoadingErrorState() {
    return this.data.isLoadingError;
  }

  get isLoadingOrErrorState() {
    return this.isLoadingState || this.isLoadingErrorState;
  }

  startLoading() {
    this.data.isLoading = true;
    this.data.isLoadingError = false;
  }

  endLoading(error = false) {
    this.data.isLoading = false;
    this.data.isLoadingError = error;
  }

  handleLoading(promise) {
    this.startLoading();

    return new Promise((resolve, reject) => {
      promise
        .then((data) => {
          this.endLoading(this.data.isLoadingError);

          resolve(data);
        })
        .catch((error) => {
          this.endLoading(true);

          reject(error);
        });
    });
  }
}

export default LoaderService;
