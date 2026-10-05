import StoreLayout from "./(store)/layout";
import StoreNotFound from "./(store)/not-found";

// Unmatched URLs render outside the (store) group, so wrap the 404 in the store chrome.
export default function NotFound() {
  return <StoreLayout><StoreNotFound /></StoreLayout>;
}
